
import React, { useContext, useState } from "react";
import { CarritoContext } from "../../Context/CarritoContext";
import "./Checkout.css";

const Checkout = () => {
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirmacion, setEmailConfirmacion] = useState("");
  const [error, setError] = useState("");
  const [ordenId, setOrdenId] = useState("");

  const { carrito, vaciarCarrito, total } = useContext(CarritoContext);


  const manejadorFormulario = (event) => {
    event.preventDefault();

    if (!nombre || !apellido || !telefono || !email || !emailConfirmacion) {
      setError("Faltan completar datos");
      return;
    }

    if (email !== emailConfirmacion) {
      setError("Los campos de email no coinciden!");
      return;
    }

    // Obtener cartId y token desde localStorage
    const cartId = localStorage.getItem('cartId');
    const token = localStorage.getItem('token');

    if (!cartId || !token) {
      setError("No se encontró el carrito o el token de usuario. Inicia sesión nuevamente.");
      return;
    }

    fetch(`http://localhost:8080/api/carts/${cartId}/purchase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al finalizar la compra");
        return res.json();
      })
      .then((data) => {
        setOrdenId(data.payload?.ticket?.code || "");
        vaciarCarrito();
      })
      .catch((error) => {
        console.log(error);
        setError("Se produjo un error al finalizar la compra");
      });
  };

  return (
    <div className="contenedor-form">
      <h2>Checkout:</h2>
      <form className="formulario" onSubmit={manejadorFormulario}>
        <div>
          <label htmlFor="">Nombre</label>
          <input type="text" onChange={(e) => setNombre(e.target.value)} />
        </div>
        <div>
          <label htmlFor="">Apellido</label>
          <input type="text" onChange={(e) => setApellido(e.target.value)} />
        </div>
        <div>
          <label htmlFor="">Telefono</label>
          <input type="text" onChange={(e) => setTelefono(e.target.value)} />
        </div>
        <div>
          <label htmlFor="">Email</label>
          <input type="email" onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label htmlFor="">Email Confirmacion</label>
          <input type="email" onChange={(e) => setEmailConfirmacion(e.target.value)} />
        </div>

        {error && (
          <p className="error" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button className="fin-compra" type="submit">
          Finalizar Compra
        </button>

        {ordenId && (
          <strong className="strong-orden">
            Gracias por su compra!! Tu numero de orden es: {ordenId}
          </strong>
        )}
      </form>
    </div>
  );
};

export default Checkout;