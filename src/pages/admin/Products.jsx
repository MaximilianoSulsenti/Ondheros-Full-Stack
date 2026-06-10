import { useState, useEffect } from "react";
import ProductModal from "./ProductModal";
import "./Products.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
const SORT_BY_STORAGE_KEY = "adminProductsSortBy";
const SORT_ORDER_STORAGE_KEY = "adminProductsSortOrder";
const PAGE_SIZE = 8;

const Products = () => {
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState(() => localStorage.getItem(SORT_BY_STORAGE_KEY) || "nombre");
  const [sortOrder, setSortOrder] = useState(() => localStorage.getItem(SORT_ORDER_STORAGE_KEY) || "asc");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cargar productos desde la API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${backendUrl}/api/products`, {
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

  useEffect(() => {
    localStorage.setItem(SORT_BY_STORAGE_KEY, sortBy);
    localStorage.setItem(SORT_ORDER_STORAGE_KEY, sortOrder);
  }, [sortBy, sortOrder]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, sortBy, sortOrder]);

  useEffect(() => {
    if (!pendingDelete) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPendingDelete(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingDelete]);

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
    const res = await fetch(`${backendUrl}/api/products/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      setProducts(products.filter(p => (p._id || p.id) !== id));
    } else {
      alert("Error al eliminar el producto");
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(field);
    setSortOrder("asc");
  };

  const filteredProducts = products.filter(p => {
    const matchSearch =
      (p.nombre || "").toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "" || p.categoria === categoryFilter;
    return matchSearch && matchCategory;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    const multiplier = sortOrder === "asc" ? 1 : -1;

    if (sortBy === "precio") {
      return (Number(a.precio || 0) - Number(b.precio || 0)) * multiplier;
    }

    if (sortBy === "stock") {
      return (Number(a.stock || 0) - Number(b.stock || 0)) * multiplier;
    }

    if (sortBy === "categoria") {
      return String(a.categoria || "").localeCompare(String(b.categoria || "")) * multiplier;
    }

    return String(a.nombre || "").localeCompare(String(b.nombre || "")) * multiplier;
  });

  const totalPages = Math.max(1, Math.ceil(sortedProducts.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedProducts = sortedProducts.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  const getVisiblePages = () => {
    const pages = [];
    const maxButtons = 5;
    const start = Math.max(1, safeCurrentPage - 2);
    const end = Math.min(totalPages, start + maxButtons - 1);
    const adjustedStart = Math.max(1, end - maxButtons + 1);

    for (let page = adjustedStart; page <= end; page += 1) {
      pages.push(page);
    }
    return pages;
  };

  const lowStockCount = filteredProducts.filter((p) => Number(p.stock || 0) <= 5).length;
  const totalStock = filteredProducts.reduce((acc, p) => acc + Number(p.stock || 0), 0);
  const categoriesCount = new Set(filteredProducts.map((p) => (p.categoria || "").toLowerCase()).filter(Boolean)).size;
  if (loading) return <div className="products-loading">Cargando productos...</div>;
  if (error) return <div className="products-error">Error: {error}</div>;

  return (
    <section className="products-page">
      <div className="products-header">
        <div>
          <h1>Productos</h1>
          <p>Gestiona tu catalogo, stock y categorias.</p>
        </div>
        <button
          className="create-btn"
          onClick={() => {
            setEditingProduct(null);
            setShowModal(true);
          }}
        >
          + Crear producto
        </button>
      </div>

      <div className="products-stats">
        <article className="products-stat-card">
          <span>Resultados</span>
          <strong>{filteredProducts.length}</strong>
        </article>
        <article className="products-stat-card">
          <span>Stock total</span>
          <strong>{totalStock}</strong>
        </article>
        <article className="products-stat-card">
          <span>Stock bajo ({"<="} 5)</span>
          <strong>{lowStockCount}</strong>
        </article>
        <article className="products-stat-card">
          <span>Categorias</span>
          <strong>{categoriesCount}</strong>
        </article>
      </div>

      <div className="products-filters">
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
          <option value="">Todas las categorias</option>
          <option value="remeras">Remeras</option>
          <option value="billeteras">Billeteras</option>
          <option value="medias">Medias</option>
        </select>
      </div>

      <div className="products-table-wrap">
        <table className="admin-table products-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>
                <button type="button" className="products-sort-btn" onClick={() => handleSort("nombre")}>
                  Producto {sortBy === "nombre" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </button>
              </th>
              <th>
                <button type="button" className="products-sort-btn" onClick={() => handleSort("precio")}>
                  Precio {sortBy === "precio" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </button>
              </th>
              <th>
                <button type="button" className="products-sort-btn" onClick={() => handleSort("categoria")}>
                  Categoria {sortBy === "categoria" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </button>
              </th>
              <th>
                <button type="button" className="products-sort-btn" onClick={() => handleSort("stock")}>
                  Stock {sortBy === "stock" ? (sortOrder === "asc" ? "↑" : "↓") : "↕"}
                </button>
              </th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="products-empty-row">No hay productos para mostrar con los filtros actuales.</td>
              </tr>
            ) : (
              paginatedProducts.map((p) => (
                <tr key={p._id || p.id}>
                  <td>
                    {p.imagen || p.image ? (
                      <img
                        src={p.imagen || p.image}
                        alt={p.nombre}
                        className="products-thumb"
                      />
                    ) : (
                      <span className="products-no-image">Sin imagen</span>
                    )}
                  </td>
                  <td className="products-name-cell">{p.nombre}</td>
                  <td>${Number(p.precio || 0).toLocaleString("es-AR")}</td>
                  <td>{p.categoria || "-"}</td>
                  <td>
                    <span className={`products-stock-badge ${Number(p.stock || 0) <= 5 ? "is-low" : "is-ok"}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td>
                    <div className="products-actions">
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
                        onClick={() => setPendingDelete(p)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="products-cards-mobile">
        {sortedProducts.length === 0 ? (
          <div className="products-empty-row">No hay productos para mostrar con los filtros actuales.</div>
        ) : (
          paginatedProducts.map((p) => (
            <article className="products-mobile-card" key={`mobile-${p._id || p.id}`}>
              <div className="products-mobile-head">
                {p.imagen || p.image ? (
                  <img
                    src={p.imagen || p.image}
                    alt={p.nombre}
                    className="products-thumb"
                  />
                ) : (
                  <span className="products-no-image">Sin imagen</span>
                )}
                <div>
                  <h3>{p.nombre}</h3>
                  <p>{p.categoria || "-"}</p>
                </div>
              </div>
              <div className="products-mobile-meta">
                <span>Precio: ${Number(p.precio || 0).toLocaleString("es-AR")}</span>
                <span className={`products-stock-badge ${Number(p.stock || 0) <= 5 ? "is-low" : "is-ok"}`}>
                  Stock: {p.stock}
                </span>
              </div>
              <div className="products-actions">
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
                  onClick={() => setPendingDelete(p)}
                >
                  Eliminar
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {sortedProducts.length > 0 && (
        <div className="products-pagination">
          <button
            type="button"
            className="products-page-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={safeCurrentPage === 1}
          >
            Anterior
          </button>

          <div className="products-page-list">
            {getVisiblePages().map((page) => (
              <button
                key={page}
                type="button"
                className={`products-page-btn ${page === safeCurrentPage ? "is-active" : ""}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="products-page-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={safeCurrentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      <ProductModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={saveProduct}
        editingProduct={editingProduct}
      />

      {pendingDelete && (
        <div className="products-confirm-overlay" role="dialog" aria-modal="true">
          <div className="products-confirm-modal">
            <h3>Confirmar eliminación</h3>
            <p>
              Se eliminará el producto <strong>{pendingDelete.nombre}</strong>. Esta acción no se puede deshacer.
            </p>
            <div className="products-confirm-actions">
              <button
                type="button"
                className="products-confirm-cancel"
                onClick={() => setPendingDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="products-confirm-delete"
                onClick={async () => {
                  const id = pendingDelete?._id || pendingDelete?.id;
                  if (id) await deleteProduct(id);
                  setPendingDelete(null);
                }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default Products;
