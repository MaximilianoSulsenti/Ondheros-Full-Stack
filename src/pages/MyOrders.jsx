import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./MyOrders.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const getPaymentLabel = (status, provider) => {
  if (provider === "whatsapp" && status === "in_process") {
    return "Pedido enviado por WhatsApp";
  }
  if (provider === "whatsapp" && status === "pending") {
    return "Pendiente de enviar por WhatsApp";
  }
  switch (status) {
    case "approved":
      return "Pagado";
    case "pending":
      return "Pendiente";
    case "rejected":
      return "Rechazado";
    case "in_process":
      return "En proceso";
    case "cancelled":
      return "Cancelado";
    default:
      return "Sin estado";
  }
};

const getFulfillmentLabel = (status) => {
  switch (status) {
    case "delivered":
      return "Entregado";
    case "cancelled":
      return "Cancelado";
    default:
      return "Pendiente";
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoadingByCode, setActionLoadingByCode] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendUrl}/api/carts/my-tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("No se pudieron cargar tus pedidos");

        const data = await res.json();
        setOrders(data.payload || []);
      } catch (err) {
        setError(err.message || "Error al cargar pedidos");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const totalSpent = useMemo(
    () => orders.reduce((acc, order) => acc + Number(order.amount || 0), 0),
    [orders]
  );

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const toggleExpanded = (orderId) => {
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const isRetryablePayment = (status) => ["pending", "rejected", "cancelled", "unknown"].includes(status);

  const handlePayNow = async (ticketCode) => {
    setError("");
    if (!ticketCode) return;

    setActionLoadingByCode((prev) => ({ ...prev, [ticketCode]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/payments/mercadopago/preference`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ticketCode })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo iniciar el pago");
      }

      const initPoint = data?.payload?.initPoint || data?.payload?.sandboxInitPoint;
      if (!initPoint) {
        throw new Error("Mercado Pago no devolvió una URL de pago");
      }

      window.location.href = initPoint;
    } catch (err) {
      setError(err.message || "Error al iniciar el pago");
    } finally {
      setActionLoadingByCode((prev) => ({ ...prev, [ticketCode]: false }));
    }
  };

  const handleDeleteOrder = async (ticketCode) => {
    setError("");
    if (!ticketCode) return;

    const confirmDelete = window.confirm("¿Eliminar este pedido pendiente/rechazado?");
    if (!confirmDelete) return;

    setActionLoadingByCode((prev) => ({ ...prev, [ticketCode]: true }));
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/payments/mercadopago/tickets/${ticketCode}/cancel`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || "No se pudo eliminar el pedido");
      }

      setOrders((prev) => prev.filter((order) => order.code !== ticketCode));
    } catch (err) {
      setError(err.message || "Error al eliminar el pedido");
    } finally {
      setActionLoadingByCode((prev) => ({ ...prev, [ticketCode]: false }));
    }
  };

  if (loading) return <div className="my-orders-state">Cargando tus pedidos...</div>;
  if (error) return <div className="my-orders-state my-orders-error">{error}</div>;

  return (
    <section className="my-orders-page">
      <header className="my-orders-header">
        <h1>Mis pedidos</h1>
        <Link to="/" className="my-orders-back">
          Volver al inicio
        </Link>
      </header>

      <div className="my-orders-summary">
        <div>
          <span>Pedidos</span>
          <strong>{orders.length}</strong>
        </div>
        <div>
          <span>Total gastado</span>
          <strong>${totalSpent.toLocaleString("es-AR")}</strong>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="my-orders-empty">
          <p>Todavia no tienes compras registradas.</p>
          <Link to="/" className="my-orders-shop-link">
            Ir a comprar
          </Link>
        </div>
      ) : (
        <div className="my-orders-list">
          {orders.map((order) => {
            const orderId = order._id || order.code;
            const products = Array.isArray(order.products) ? order.products : [];
            const itemsCount = products.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
            const isExpanded = Boolean(expanded[orderId]);
            const canRetryPayment = isRetryablePayment(order.paymentStatus);
            const isActionLoading = Boolean(actionLoadingByCode[order.code]);
            return (
              <article className="my-orders-card" key={orderId}>
                <div className="my-orders-card-head">
                  <div>
                    <p className="my-orders-code">{order.code || "Sin codigo"}</p>
                    <p className="my-orders-date">{formatDate(order.purchase_datetime || order.createdAt)}</p>
                  </div>
                  <strong>${Number(order.amount || 0).toLocaleString("es-AR")}</strong>
                </div>

                <div className="my-orders-actions">
                  <span>{itemsCount} item(s)</span>
                  <span>Pago: {getPaymentLabel(order.paymentStatus, order.paymentProvider)}</span>
                  <span>Entrega: {getFulfillmentLabel(order.fulfillmentStatus)}</span>
                  <div className="my-orders-actions-right">
                    {canRetryPayment && (
                      <>
                        <button
                          type="button"
                          className="my-orders-toggle my-orders-pay"
                          onClick={() => handlePayNow(order.code)}
                          disabled={isActionLoading}
                        >
                          {isActionLoading ? "Procesando..." : "Pagar ahora"}
                        </button>
                        <button
                          type="button"
                          className="my-orders-toggle my-orders-delete"
                          onClick={() => handleDeleteOrder(order.code)}
                          disabled={isActionLoading}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                    <button
                      type="button"
                      className="my-orders-toggle"
                      onClick={() => toggleExpanded(orderId)}
                    >
                      {isExpanded ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <ul className="my-orders-products">
                    {products.map((productItem, idx) => {
                      const product = productItem.product || {};
                      const name = product.nombre || `Producto ${idx + 1}`;
                      const quantity = Number(productItem.quantity || 0);
                      const price = Number(productItem.price || product.precio || 0);
                      return (
                        <li key={`${orderId}-${idx}`}>
                          <span>{name}</span>
                          <span>{quantity} x ${price.toLocaleString("es-AR")}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default MyOrders;
