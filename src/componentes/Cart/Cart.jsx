import { useContext, useState } from "react"
import { CarritoContext } from "../../Context/CarritoContext"
import { Link } from "react-router-dom"
import CartItem from "../CartItem/CartItem"
import "./Cart.css"
import { Loader } from "../Loader/Loader"
import { toast } from "react-toastify"

const Cart = () => {

  const { carrito, total, cantidadTotal, vaciarCarrito } = useContext(CarritoContext)
  const [loading, setLoading] = useState(false)

  const handleVaciarCarrito = async () => {
    setLoading(true)
    try {
      await vaciarCarrito()
      toast.success("Carrito vaciado", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      })
    } catch (error) {
      toast.error("Error al vaciar el carrito", {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      })
    } finally {
      setLoading(false)
    }
  }

  if (carrito.length === 0) {
    return (
      <div className="carrito-vacio">
        <h2 className="sin-product">No hay productos en el Carrito</h2>
        <Link to="/" className="ver-productos">Ver Productos</Link>
      </div>
    )
  }

  return (
    <div className="cart-container">
      <h1>Resumen del Carrito</h1>
      <div className="cart-header">
        <span className="sinimg"></span>
        <span>Producto</span>
        <span>Talle</span>
        <span>Cantidad</span>
        <span>Precio</span>
        <span>Subtotal</span>
      </div>
      {loading ? (
        <Loader />
      ) : (
        <>
          {carrito.map((producto, idx) => (
            <CartItem
              key={
                (producto.product?._id || producto.product) + '-' + (producto.talla || 'notalla')
              }
              item={producto.product}
              cantidad={producto.quantity}
              talla={producto.talla}
            />
          ))}
          <div className="cart-footer">
            <h2>Cantidad Productos: {cantidadTotal}</h2>
            <h3>Total: ${total}</h3>
            <button onClick={handleVaciarCarrito} className="vaciar-carrito" disabled={loading}>Vaciar Carrito</button>
            <Link to="/checkout" className="finalizar-compra">Finalizar Compra</Link>
          </div>
        </>
      )}
    </div>
  )
}


export default Cart