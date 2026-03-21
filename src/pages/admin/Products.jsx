import { useState, useEffect } from "react";
import ProductModal from "./ProductModal";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/products", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener productos");
        const data = await res.json();
        setProducts(data.payload || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const saveProduct = (product) => {
    if (editingProduct) {
      setProducts(products.map(p =>
        (p._id || p.id) === (product._id || product.id) ? product : p
      ));
      setEditingProduct(null);
    } else {
      setProducts([...products, product]);
    }
  };

  const deleteProduct = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`http://localhost:8080/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setProducts(products.filter(p => (p._id || p.id) !== id));
    } else {
      alert("Error al eliminar el producto");
    }
  };

  const filteredProducts = products.filter(p => {
    const matchSearch =
      (p.title || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });



  if (loading) return <div>Cargando productos...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <div>
      <h1>Productos</h1>
      <button
        className="create-btn"
        onClick={() => {
          setEditingProduct(null);
          setShowModal(true);
        }}
      >
        + Crear producto
      </button>
      <input
        type="text"
        placeholder="Buscar producto..."
        className="search-input"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select
        className="category-filter"
        value={categoryFilter}
        onChange={(e) => setCategoryFilter(e.target.value)}
      >
        <option value="">Todas las categorías</option>
        <option value="remeras">Remeras</option>
        <option value="billeteras">Billeteras</option>
        <option value="medias">Medias</option>
      </select>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Precio</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(p => (
            <tr key={p._id || p.id}>
              <td>{p.title}</td>
              <td>${p.price}</td>
              <td>{p.category}</td>
              <td>{p.stock}</td>
              <td>
                <button
                  className="edit-btn"
                  onClick={() => {
                    setEditingProduct(p);
                    setShowModal(true);
                  }}
                >
                  Editar
                </button>
                <button
                  className="delete-btn"
                  onClick={() => deleteProduct(p._id || p.id)}
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <ProductModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveProduct}
        editingProduct={editingProduct}
      />
    </div>
  );
};

export default Products;
