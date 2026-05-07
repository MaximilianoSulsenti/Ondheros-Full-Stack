
import React, { useContext, useState } from "react";
import { CarritoContext } from "../../Context/CarritoContext";
import "./Checkout.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Checkout = () => {
  const [error, setError] = useState("");
  const [ordenId, setOrdenId] = useState("");
  const [loading, setLoading] = useState(false);
  const [pedidoEnviado, setPedidoEnviado] = useState(false);
  const { carrito, vaciarCarrito, total } = useContext(CarritoContext);

  const finalizarCompra = async () => {
    setLoading(true);
    setError("");
    const cartId = localStorage.getItem('cartId');
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
        }
      });
      if (!res.ok) throw new Error("Error al finalizar la compra");
      const data = await res.json();
      setOrdenId(data.payload?.ticket?.code || "");
      vaciarCarrito();
    } catch (error) {
      setError("Se produjo un error al finalizar la compra");
    } finally {
      setLoading(false);
    }
  };

  // Función para armar el mensaje de WhatsApp
  const armarMensajeWhatsapp = () => {
    let mensaje = `¡Hola! Quiero confirmar mi pedido:\n\n`;
    mensaje += `*Detalle del pedido:*\n`;
    carrito.forEach((prod, idx) => {
      mensaje += `- ${prod.product?.nombre} | Talle: ${prod.talla || '-'} | Cantidad: ${prod.quantity} | Precio: $${prod.product?.precio} | Subtotal: $${prod.product?.precio * prod.quantity}\n`;
    });
    mensaje += `\n*Total a pagar:* $${total}`;
    if (ordenId) mensaje += `\n*Código de orden:* ${ordenId}`;
    return encodeURIComponent(mensaje);
  };

  // Número de WhatsApp destino (cámbialo por el tuyo)
  const numeroWhatsapp = "3416055953";

  const handleEnviarWhatsapp = () => {
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
      <button className="fin-compra" onClick={finalizarCompra} disabled={loading}>
        {loading ? "Procesando..." : "Finalizar Compra"}
      </button>
      {ordenId && (
        <>
          <strong className="strong-orden">
            ¡Gracias por su compra! Tu número de orden es: {ordenId}
          </strong>
          <button
            className="whatsapp-btn"
            style={{ marginTop: 16, background: '#25D366', color: 'white', fontWeight: 'bold', border: 'none', borderRadius: 6, padding: '10px 18px', cursor: 'pointer' }}
            onClick={handleEnviarWhatsapp}
          >
            Enviar pedido por WhatsApp
          </button>
          {pedidoEnviado && <p style={{ color: '#25D366', marginTop: 8 }}>¡Pedido enviado por WhatsApp!</p>}
        </>
      )}
    </div>
  );
};

export default Checkout;