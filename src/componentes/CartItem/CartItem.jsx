import { useContext } from "react"
import { CarritoContext } from "../../Context/CarritoContext"
import "./CartItem.css"


const CartItem = ({item, cantidad}) => {

    const {eliminarProducto} = useContext(CarritoContext)

  return (

   <div className="cart-item">
      <img src={item.imagen} alt={item.nombre} style={{width: "110px", height: "110px",objectFit: "cover", borderRadius: "8px", marginRight: "15px", alignItems: "center"}}/>
      <span className="nombre">{item.nombre}</span>
      <span>{cantidad}</span>
      <span>${item.precio}</span>
      <span>${item.precio * cantidad}</span>
      <button className="boton-eliminar" onClick={() => eliminarProducto(item.id)}>
        X
      </button>
    </div>
  )
}

export default CartItem