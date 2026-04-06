import { useState, useEffect } from "react";
import "./ItemListContainer.css";
import ItemList from "../ItemList/ItemList";
import { useParams } from "react-router-dom";
import { Loader } from "../Loader/Loader";

const API_URL = "http://localhost:8080/api/products"; // Cambia el puerto si tu backend usa otro

const ItemListContainer = () => {
  const [productos, setProductos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const { categoriaId } = useParams();

  // Buscador de productos por nombre, categoria o descripcion
  const productosFiltrados = productos.filter((prod) =>
    prod.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.categoria.toLowerCase().includes(busqueda.toLowerCase()) ||
    prod.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    setLoading(true);
    let url = API_URL;
    if (categoriaId) {
      url += `?query=${encodeURIComponent(categoriaId)}`;
    }
    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener productos");
        return res.json();
      })
      .then((data) => {
        // Ajuste: el backend devuelve { payload: [...] }
        const productosData = Array.isArray(data) ? data : data.payload || [];
        setProductos(productosData);
      })
      .catch((error) => {
        console.log(error);
        setProductos([]);
      })
      .finally(() => setLoading(false));
  }, [categoriaId]);

  return (
    <>
      <div style={{ display: "flex", justifyContent: "center", margin: "30px 0" }}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          style={{
            padding: "10px",
            fontSize: "18px",
            width: "350px",
            borderRadius: "8px",
            border: "1px solid #ccc",
            textAlign: "center"
          }}
        />
      </div>

      {loading ? <Loader /> : <ItemList productos={productosFiltrados} />}
    </>
  );
};

export default ItemListContainer;