import { useEffect, useState } from "react";
import "./Orders.css";

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

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [activePreset, setActivePreset] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const [archivingMap, setArchivingMap] = useState({});
  const [paymentUpdateMap, setPaymentUpdateMap] = useState({});
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendUrl}/api/carts/tickets`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener pedidos");
        const data = await res.json();
        setOrders(data.payload || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const getOrderDate = (order) => {
    const rawDate = order.purchase_datetime || order.createdAt;
    const parsedDate = rawDate ? new Date(rawDate) : null;
    return parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;
  };

  const filteredOrders = orders.filter((order) => {
    const normalized = query.trim().toLowerCase();
    const code = String(order.code || "").toLowerCase();
    const purchaser = String(order.purchaser || order.user || "").toLowerCase();

    const textMatches = !normalized || code.includes(normalized) || purchaser.includes(normalized);

    const orderDate = getOrderDate(order);
    const fromMatches = !fromDate || (orderDate && orderDate >= new Date(`${fromDate}T00:00:00`));
    const toMatches = !toDate || (orderDate && orderDate <= new Date(`${toDate}T23:59:59`));

    const archivedMatches = showArchived ? true : !order.archived;

    return textMatches && fromMatches && toMatches && archivedMatches;
  });

  const totalAmount = filteredOrders.reduce((acc, order) => acc + Number(order.amount || order.total || 0), 0);
  const totalItems = filteredOrders.reduce((acc, order) => {
    const items = Array.isArray(order.products) ? order.products : [];
    return acc + items.reduce((innerAcc, item) => innerAcc + Number(item.quantity || 0), 0);
  }, 0);

  const toggleExpanded = (orderId) => {
    setExpanded((prev) => ({ ...prev, [orderId]: !prev[orderId] }));
  };

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

  const clearFilters = () => {
    setQuery("");
    setFromDate("");
    setToDate("");
    setActivePreset("");
  };

  const toInputDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const applyDatePreset = (preset) => {
    const now = new Date();
    if (preset === "today") {
      const today = toInputDate(now);
      setFromDate(today);
      setToDate(today);
      setActivePreset(preset);
      return;
    }

    if (preset === "last7") {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 6);
      setFromDate(toInputDate(sevenDaysAgo));
      setToDate(toInputDate(now));
      setActivePreset(preset);
      return;
    }

    if (preset === "month") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setFromDate(toInputDate(firstDay));
      setToDate(toInputDate(lastDay));
      setActivePreset(preset);
    }
  };

  const exportToCSV = () => {
    if (filteredOrders.length === 0) return;

    const escapeCSV = (value) => {
      const str = String(value ?? "").replaceAll('"', '""');
      return `"${str}"`;
    };

    const headers = [
      "Codigo",
      "Fecha",
      "Cliente",
      "Total",
      "CantidadItems",
      "Productos"
    ];

    const rows = filteredOrders.map((order) => {
      const items = Array.isArray(order.products) ? order.products : [];
      const itemsCount = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
      const productsSummary = items
        .map((item, idx) => {
          const product = item.product || {};
          const productName = product.nombre || `Producto ${idx + 1}`;
          const quantity = Number(item.quantity || 0);
          const unitPrice = Number(item.price || product.precio || 0);
          return `${productName} (${quantity} x $${unitPrice})`;
        })
        .join(" | ");

      return [
        order.code || "Sin codigo",
        formatDate(order.purchase_datetime || order.createdAt),
        order.purchaser || order.user || "Sin email",
        Number(order.amount || order.total || 0),
        itemsCount,
        productsSummary
      ];
    });

    const csvContent = [headers, ...rows]
      .map((line) => line.map(escapeCSV).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pedidos-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  const handleArchiveToggle = async (order) => {
    const ticketId = order._id;
    if (!ticketId) return;

    setArchivingMap((prev) => ({ ...prev, [ticketId]: true }));
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const nextArchived = !Boolean(order.archived);
      const res = await fetch(`${backendUrl}/api/carts/tickets/${ticketId}/archive`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ archived: nextArchived })
      });

      if (!res.ok) throw new Error("No se pudo actualizar el estado del pedido");

      const data = await res.json();
      const updatedTicket = data.payload;
      setOrders((prev) => prev.map((o) => (o._id === updatedTicket._id ? updatedTicket : o)));
    } catch (err) {
      setError(err.message);
    } finally {
      setArchivingMap((prev) => ({ ...prev, [ticketId]: false }));
    }
  };

  const handleWhatsappStatusUpdate = async (order, paymentStatus, paymentStatusDetail) => {
    const ticketCode = order.code;
    if (!ticketCode) return;

    setPaymentUpdateMap((prev) => ({ ...prev, [ticketCode]: true }));
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/payments/whatsapp/admin/tickets/${ticketCode}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ paymentStatus, paymentStatusDetail })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar el estado del pago");

      const updatedTicket = data.payload;
      setOrders((prev) => prev.map((currentOrder) => (currentOrder._id === updatedTicket._id ? updatedTicket : currentOrder)));
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentUpdateMap((prev) => ({ ...prev, [ticketCode]: false }));
    }
  };

  const handleFulfillmentUpdate = async (order, fulfillmentStatus) => {
    const ticketCode = order.code;
    if (!ticketCode) return;

    setPaymentUpdateMap((prev) => ({ ...prev, [ticketCode]: true }));
    setError(null);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/payments/admin/tickets/${ticketCode}/fulfillment`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ fulfillmentStatus })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "No se pudo actualizar la entrega");

      const updatedTicket = data.payload;
      setOrders((prev) => prev.map((currentOrder) => (currentOrder._id === updatedTicket._id ? updatedTicket : currentOrder)));
    } catch (err) {
      setError(err.message);
    } finally {
      setPaymentUpdateMap((prev) => ({ ...prev, [ticketCode]: false }));
    }
  };

  if (loading) return <div className="orders-loading">Cargando pedidos...</div>;
  if (error) return <div className="orders-error">Error: {error}</div>;

  return (
    <div className="orders-page">
      <div className="orders-topbar">
        <h1>Pedidos</h1>
        <div className="orders-controls no-print">
          <input
            className="orders-search"
            type="text"
            placeholder="Buscar por codigo o email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <input
            className="orders-date"
            type="date"
            value={fromDate}
            onChange={(e) => {
              setFromDate(e.target.value);
              setActivePreset("");
            }}
            title="Desde"
          />
          <input
            className="orders-date"
            type="date"
            value={toDate}
            onChange={(e) => {
              setToDate(e.target.value);
              setActivePreset("");
            }}
            title="Hasta"
          />
          <button
            type="button"
            className={`orders-btn ${activePreset === "today" ? "orders-btn-active" : ""}`}
            onClick={() => applyDatePreset("today")}
          >
            Hoy
          </button>
          <button
            type="button"
            className={`orders-btn ${activePreset === "last7" ? "orders-btn-active" : ""}`}
            onClick={() => applyDatePreset("last7")}
          >
            Ultimos 7 dias
          </button>
          <button
            type="button"
            className={`orders-btn ${activePreset === "month" ? "orders-btn-active" : ""}`}
            onClick={() => applyDatePreset("month")}
          >
            Este mes
          </button>
          <button type="button" className="orders-btn" onClick={clearFilters}>Limpiar</button>
          <button
            type="button"
            className={`orders-btn ${showArchived ? "orders-btn-active" : ""}`}
            onClick={() => setShowArchived((prev) => !prev)}
          >
            {showArchived ? "Ocultar archivados" : "Mostrar archivados"}
          </button>
          <button type="button" className="orders-btn" onClick={exportToCSV}>Exportar CSV</button>
          <button type="button" className="orders-btn orders-btn-primary" onClick={exportToPDF}>Exportar PDF</button>
        </div>
      </div>

      <div className="orders-stats">
        <div className="orders-stat-card">
          <span className="orders-stat-label">Pedidos</span>
          <strong>{filteredOrders.length}</strong>
        </div>
        <div className="orders-stat-card">
          <span className="orders-stat-label">Productos vendidos</span>
          <strong>{totalItems}</strong>
        </div>
        <div className="orders-stat-card">
          <span className="orders-stat-label">Facturacion</span>
          <strong>${totalAmount.toLocaleString("es-AR")}</strong>
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="orders-empty">No hay pedidos para mostrar.</div>
      ) : (
        <div className="orders-list">
          {filteredOrders.map((order) => {
            const orderId = order._id || order.id || order.code;
            const isOpen = Boolean(expanded[orderId]);
            const items = Array.isArray(order.products) ? order.products : [];
            const itemsCount = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
            const isWhatsappOrder = order.paymentProvider === "whatsapp";
            const isUpdatingPayment = Boolean(paymentUpdateMap[order.code]);

            return (
              <article className="orders-card" key={orderId}>
                <header className="orders-card-head">
                  <div>
                    <p className="orders-code">{order.code || "Sin codigo"}</p>
                    <p className="orders-meta">{formatDate(order.purchase_datetime || order.createdAt)}</p>
                    {order.archived && <span className="orders-badge-archived">Archivado</span>}
                  </div>
                  <div className="orders-meta-block">
                    <span>{order.purchaser || order.user || "Sin email"}</span>
                    <strong>${Number(order.amount || order.total || 0).toLocaleString("es-AR")}</strong>
                  </div>
                </header>

                <div className="orders-card-row">
                  <span>{itemsCount} item(s)</span>
                  <span>Pago: {getPaymentLabel(order.paymentStatus, order.paymentProvider)}</span>
                  <span>Entrega: {getFulfillmentLabel(order.fulfillmentStatus)}</span>
                  <div className="orders-actions-inline">
                    <button className="orders-toggle" onClick={() => toggleExpanded(orderId)}>
                      {isOpen ? "Ocultar detalle" : "Ver detalle"}
                    </button>
                    {isWhatsappOrder && order.paymentStatus !== "approved" && (
                      <button
                        type="button"
                        className="orders-toggle orders-mark-paid"
                        onClick={() => handleWhatsappStatusUpdate(order, "approved", "whatsapp_payment_confirmed")}
                        disabled={isUpdatingPayment}
                      >
                        {isUpdatingPayment ? "Guardando..." : "Marcar pagado"}
                      </button>
                    )}
                    {isWhatsappOrder && order.paymentStatus !== "cancelled" && order.paymentStatus !== "approved" && (
                      <button
                        type="button"
                        className="orders-toggle orders-mark-cancelled"
                        onClick={() => handleWhatsappStatusUpdate(order, "cancelled", "whatsapp_order_cancelled")}
                        disabled={isUpdatingPayment}
                      >
                        Cancelar pedido
                      </button>
                    )}
                    {order.paymentStatus === "approved" && order.fulfillmentStatus !== "delivered" && (
                      <button
                        type="button"
                        className="orders-toggle orders-mark-delivered"
                        onClick={() => handleFulfillmentUpdate(order, "delivered")}
                        disabled={isUpdatingPayment}
                      >
                        {isUpdatingPayment ? "Guardando..." : "Marcar entregado"}
                      </button>
                    )}
                    <button
                      type="button"
                      className={`orders-toggle ${order.archived ? "orders-unarchive" : "orders-archive"}`}
                      onClick={() => handleArchiveToggle(order)}
                      disabled={Boolean(archivingMap[order._id]) || !order._id}
                    >
                      {Boolean(archivingMap[order._id])
                        ? "Guardando..."
                        : order.archived
                          ? "Desarchivar"
                          : "Archivar"}
                    </button>
                  </div>
                </div>

                {isOpen && (
                  <div className="orders-detail">
                    {items.length === 0 ? (
                      <p>Este pedido no tiene productos asociados.</p>
                    ) : (
                      <ul>
                        {items.map((item, idx) => {
                          const product = item.product || {};
                          const productName = product.nombre || `Producto ${idx + 1}`;
                          const unitPrice = Number(item.price || product.precio || 0);
                          const quantity = Number(item.quantity || 0);
                          return (
                            <li key={`${orderId}-${idx}`}>
                              <span>{productName}</span>
                              <span>{quantity} x ${unitPrice.toLocaleString("es-AR")}</span>
                              <strong>${(quantity * unitPrice).toLocaleString("es-AR")}</strong>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Orders;
