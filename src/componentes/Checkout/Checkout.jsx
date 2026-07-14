
import React, { useContext, useEffect, useState } from "react";
import { CarritoContext } from "../../Context/CarritoContext";
import "./Checkout.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const mercadoPagoCheckoutUrl = import.meta.env.VITE_MERCADOPAGO_CHECKOUT_URL;

const mapPaymentStatusFromQuery = (status) => {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "success") return "approved";
  if (normalized === "pending") return "pending";
  if (normalized === "failure") return "rejected";
  return "unknown";
};

const Checkout = () => {
  const [error, setError] = useState("");
  const [ordenId, setOrdenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("whatsapp");
  const [pedidoResumen, setPedidoResumen] = useState(null);
  const [paymentReturnMessage, setPaymentReturnMessage] = useState("");
  const { carrito, total, cartId, limpiarCarritoLocal } = useContext(CarritoContext);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get("payment_status");
    const orderCode = params.get("order") || "";
    const paymentId = params.get("payment_id");

    if (!paymentStatus || !orderCode) return;

    const syncPaymentStatus = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const mappedStatus = mapPaymentStatusFromQuery(paymentStatus);
        await fetch(`${backendUrl}/api/payments/mercadopago/tickets/${orderCode}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            paymentStatus: mappedStatus,
            paymentStatusDetail: paymentStatus,
            paymentId
          })
        });
      } catch (syncError) {
        console.error("No se pudo sincronizar el estado del pago:", syncError);
      }
    };

    setOrdenId(orderCode);
    if (paymentStatus === "success") {
      setPaymentReturnMessage("Pago acreditado correctamente.");
      setError("");
    } else if (paymentStatus === "pending") {
      setPaymentReturnMessage("Pago pendiente de confirmación.");
      setError("");
    } else if (paymentStatus === "failure") {
      setPaymentReturnMessage("");
      setError("El pago fue rechazado o cancelado. Puedes intentar nuevamente.");
    }

    syncPaymentStatus();
  }, []);

  const construirUrlMercadoPago = (orderCode, amount) => {
    if (!mercadoPagoCheckoutUrl) return null;

    try {
      const url = new URL(mercadoPagoCheckoutUrl);
      if (orderCode) url.searchParams.set("external_reference", orderCode);
      if (amount != null) url.searchParams.set("amount", String(amount));
      return url.toString();
    } catch {
      return mercadoPagoCheckoutUrl;
    }
  };

  const crearPreferenciaMercadoPago = async (ticketCode, token) => {
    const res = await fetch(`${backendUrl}/api/payments/mercadopago/preference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ ticketCode })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data?.error || "No se pudo crear la preferencia de Mercado Pago");
    }

    return data?.payload?.initPoint || data?.payload?.sandboxInitPoint || null;
  };

  const construirResumenPedido = () => {
    const items = carrito.map((prod) => ({
      nombre: prod.product?.nombre || "Producto",
      talla: prod.talla || "-",
      cantidad: Number(prod.quantity || 0),
      precio: Number(prod.product?.precio || 0)
    }));

    return {
      items,
      total: Number(total || 0)
    };
  };

  const finalizarCompra = async () => {
    setLoading(true);
    setError("");
    setPedidoEnviado(false);

    if (!Array.isArray(carrito) || carrito.length === 0) {
      setError("No hay productos en el carrito para finalizar la compra.");
      setLoading(false);
      return;
    }

    const resumenActual = construirResumenPedido();
    const token = localStorage.getItem('token');
    if (!cartId || !token) {
      setError("No se encontró el carrito o el token de usuario. Inicia sesión nuevamente.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${backendUrl}/api/carts/${cartId}/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ paymentMethod })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Error al finalizar la compra");
      }
      const generatedOrderCode = data.payload?.ticket?.code || "";
      setOrdenId(generatedOrderCode);
      setPedidoResumen(resumenActual);
        // El backend ya vació el carrito al procesar la compra; solo actualizamos estado local
        limpiarCarritoLocal();

      if (paymentMethod === "mercadopago") {
        let paymentUrl = null;
        let mpErrorMessage = "";
        if (generatedOrderCode) {
          try {
            paymentUrl = await crearPreferenciaMercadoPago(generatedOrderCode, token);
          } catch (mpError) {
              console.error("Error creando preferencia de Mercado Pago:", mpError);
              mpErrorMessage = `Error con Mercado Pago: ${mpError.message}`;
          }
        }

        // Fallback opcional: URL estática si no hay integración disponible
        if (!paymentUrl) {
          paymentUrl = construirUrlMercadoPago(generatedOrderCode, resumenActual.total);
        }

        if (paymentUrl) {
          window.location.href = paymentUrl;
          return;
        }

        setError(mpErrorMessage || "Pedido creado, pero no se pudo iniciar Mercado Pago. Revisá MERCADOPAGO_ACCESS_TOKEN en backend o VITE_MERCADOPAGO_CHECKOUT_URL como fallback.");
      }
    } catch (error) {
      setError(error?.message || "Se produjo un error al finalizar la compra");
    } finally {
      setLoading(false);
    }
  };

  // Función para armar el mensaje de WhatsApp
  const armarMensajeWhatsapp = () => {
    const sourceItems = pedidoResumen?.items || [];
    const sourceTotal = pedidoResumen?.total ?? total;

    let mensaje = `¡Hola! Quiero confirmar mi pedido:\n\n`;
    mensaje += `*Detalle del pedido:*\n`;
    sourceItems.forEach((prod) => {
      const subtotal = prod.precio * prod.cantidad;
      mensaje += `- ${prod.nombre} | Talle: ${prod.talla || '-'} | Cantidad: ${prod.cantidad} | Precio: $${prod.precio} | Subtotal: $${subtotal}\n`;
    });
    mensaje += `\n*Total a pagar:* $${sourceTotal}`;
    if (ordenId) mensaje += `\n*Código de orden:* ${ordenId}`;
    return encodeURIComponent(mensaje);
  };

  // Número de WhatsApp destino (cámbialo por el tuyo)
  const numeroWhatsapp = "3416055953";

  const handleEnviarWhatsapp = async () => {
    try {
      const token = localStorage.getItem("token");
      if (ordenId && token) {
        await fetch(`${backendUrl}/api/payments/whatsapp/tickets/${ordenId}/submit`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          }
        });
      }
    } catch (submitError) {
      console.error("No se pudo confirmar el pedido por WhatsApp:", submitError);
    }

    const mensaje = armarMensajeWhatsapp();
    const url = `https://wa.me/${numeroWhatsapp}?text=${mensaje}`;
    window.open(url, '_blank');
    setPedidoEnviado(true);
  };

  return (
    <div className="contenedor-form">
      <h2>Checkout</h2>
      <p>Total a pagar: <strong>${total}</strong></p>
      {/* Resumen de productos */}
      <div className="checkout-resumen">
        <div className="checkout-header">
          <span>Producto</span>
          <span>Talle</span>
          <span>Cantidad</span>
          <span>Precio</span>
          <span>Subtotal</span>
        </div>
        {carrito.length === 0 ? (
          <p>No hay productos en el carrito.</p>
        ) : (
          carrito.map((prod, idx) => (
            <div className="checkout-item" key={idx}>
              <span>{prod.product?.nombre}</span>
              <span>{prod.talla || '-'}</span>
              <span>{prod.quantity}</span>
              <span>${prod.product?.precio}</span>
              <span>${prod.product?.precio * prod.quantity}</span>
            </div>
          ))
        )}
      </div>
      {error && <p className="error" style={{ color: "red" }}>{error}</p>}
      {paymentReturnMessage && <p style={{ color: "green" }}>{paymentReturnMessage}</p>}
      <div className="checkout-payment-box">
        <label htmlFor="checkout-payment-method" className="checkout-payment-label">Método de finalización</label>
        <select
          id="checkout-payment-method"
          className="checkout-payment-select"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
          disabled={loading || Boolean(ordenId)}
        >
          <option value="whatsapp">Confirmar por WhatsApp</option>
          <option value="mercadopago">Pagar con Mercado Pago</option>
        </select>
      </div>
      <button className="fin-compra" onClick={finalizarCompra} disabled={loading}>
        {loading ? "Procesando..." : paymentMethod === "mercadopago" ? "Finalizar y pagar" : "Finalizar Compra"}
      </button>
      {ordenId && (
        <div className="checkout-result-box">
          <strong className="strong-orden">
            ¡Gracias por su compra! Tu número de orden es: {ordenId}
          </strong>
          <div className="checkout-result-actions">
            <button
              className="whatsapp-btn"
              style={{ marginTop: 16, background: '#25D366', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 6, padding: '10px 18px', cursor: 'pointer' }}
              onClick={handleEnviarWhatsapp}
            >
              Enviar pedido por WhatsApp
            </button>
            {mercadoPagoCheckoutUrl && (
              <a
                className="checkout-payment-link"
                href={construirUrlMercadoPago(ordenId, pedidoResumen?.total ?? total)}
                target="_blank"
                rel="noreferrer"
              >
                Pagar ahora con Mercado Pago
              </a>
            )}
          </div>
          {pedidoEnviado && <p style={{ color: '#25D366', marginTop: 8 }}>¡Pedido enviado por WhatsApp!</p>}
        </div>
      )}
    </div>
  );
};

export default Checkout;