import { useContext, useState } from "react"
import { toast } from "react-toastify"
import { CarritoContext } from "../../Context/CarritoContext"
import "./CartItem.css"


const CartItem = ({item, cantidad, talla}) => {

    const {eliminarProducto} = useContext(CarritoContext)
    const [loading, setLoading] = useState(false)

    const handleEliminar = async () => {
      setLoading(true)
      try {
        await eliminarProducto(item._id || item.id, talla)
        toast.success("Producto eliminado", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        })
      } catch (error) {
        toast.error("Error al eliminar producto", {
          position: "top-right",
          autoClose: 3000,
          theme: "dark"
        })
      } finally {
        setLoading(false)
      }
    }

    return (

    <div className="cart-item">
      {/* Imagen */}
      <img src={item.imagen} alt={item.nombre} style={{width: "110px", height: "110px",objectFit: "cover", borderRadius: "8px", marginRight: "15px", alignItems: "center"}}/>
      {/* Nombre */}
      <span className="nombre">{item.nombre}</span>
      {/* Talle (columna propia) */}
      <span className="cart-talle">{talla || '-'}</span>
      {/* Cantidad */}
      <span className="cart-cantidad">{cantidad}</span>
      {/* Precio */}
      <span className="cart-precio">${item.precio}</span>
      {/* Subtotal */}
      <span className="cart-subtotal">${item.precio * cantidad}</span>
      {/* Botón eliminar */}
      <span style={{display: 'flex', justifyContent: 'center'}}>
        <button className="boton-eliminar" onClick={handleEliminar} disabled={loading}>
          {loading ? "..." : "X"}
        </button>
      </span>
      {/* Detalles para mobile */}
      <div className="cart-detalles-mobile">
        <span><b>Cant:</b> {cantidad}</span>
        <span><b>Precio:</b> ${item.precio}</span>
        <span><b>Subtotal:</b> ${item.precio * cantidad}</span>
        <span><b>Talle:</b> {talla || '-'}</span>
      </div>
    </div>
  )
}

export default CartItem