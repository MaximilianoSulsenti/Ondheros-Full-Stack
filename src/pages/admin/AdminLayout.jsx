
import { Link, Outlet } from "react-router-dom";
import "./Admin.css";

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <aside className="admin-sidebar">
        <div className="admin-logo-area">
          <span className="admin-logo-icon">⚡</span>
          <h2 className="admin-logo">Panel Admin</h2>
        </div>
        <nav className="admin-nav">
          <Link to="/" className="admin-nav-link" style={{ marginTop: 24, background: '#e0e7ff', color: '#3730a3', fontWeight: 600, borderRadius: 6, padding: '8px 12px', display: 'inline-block' }}>Ir a Inicio 🏠</Link>
          <Link to="/admin" className="admin-nav-link">Dashboard</Link>
          <Link to="/admin/users" className="admin-nav-link">Usuarios</Link>
          <Link to="/admin/products" className="admin-nav-link">Productos</Link>
          <Link to="/admin/orders" className="admin-nav-link">Pedidos</Link>
        </nav>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
