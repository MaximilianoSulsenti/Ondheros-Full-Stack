import "./Item.css"
import { Link } from "react-router-dom"

const Item = ({_id, nombre, precio, imagen}) => {
  return (
    <div className="cardRemera">
        <img src={imagen} alt={nombre} />
        <h3>{nombre}</h3>
        <p><strong>${precio}</strong></p>
        <Link to={`/item/${_id}`}><button>Ver Detalles</button></Link>
    </div>
  )
}

export default Item