import "./ItemDetail.css"
import ItemCount from "../Contador/Contador"
import { useState, useContext } from "react"
import { Link } from "react-router-dom"
import { CarritoContext } from "../../Context/CarritoContext"
import { categoriasTalles } from "../../categoriaTalles"
import { toast } from "react-toastify"

const ItemDetail = ({ id, nombre, precio, imagen, stock, descripcion, categoria}) => {

  const [cantidadAgregada, setCantidadAgregada] = useState(0)
  const { agregarAlCarrito } = useContext(CarritoContext)

  const manejadorCantidad = (cantidad, talla) => {
      setCantidadAgregada(cantidad)

      const item = { id, nombre, precio, talla, imagen } 
      agregarAlCarrito(item, cantidad, talla)

      toast.success(`Se agregó ${cantidad} ${nombre} - Talle ${talla}`, {
        position: "top-right",
        autoClose: 3000,
        theme: "dark"
      })
  }
   
  const tallesDisponibles = categoriasTalles[categoria] || [];

  return (
    <div className="ItemDetail">
      <div>
        <img src={imagen} alt={nombre} />
      </div>
      <div className="detalle">
        <h2>{nombre}</h2>
        <p>{descripcion}</p>
        <h3>${precio}</h3>
        <h4>Stock: {stock}</h4>

        {cantidadAgregada > 0 ? (
          <div className="terminar-seguir">
            <button className="terminarcompra"><Link to="/cart">Terminar Compra</Link></button>
            <button className="seguircomprando"><Link to="/">Seguir Comprando</Link></button>
          </div>
        ) : 
          <ItemCount
              inicial={1}
              stock={stock}
              funcionAgregar={manejadorCantidad}
              talles={tallesDisponibles}

          />
        }
      </div>
    </div>
  )
}

export default ItemDetail
