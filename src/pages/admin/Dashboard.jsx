import { useEffect, useState } from "react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    products: 0,
    orders: 0,
    loading: true
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [usersRes, productsRes, ordersRes] = await Promise.all([
          fetch("http://localhost:8080/api/users/count", { headers }),
          fetch("http://localhost:8080/api/products/count", { headers }),
          fetch("http://localhost:8080/api/carts/tickets/count", { headers })
        ]);
        const users = await usersRes.json();
        const products = await productsRes.json();
        const orders = await ordersRes.json();
        setStats({
          users: users.count,
          products: products.count,
          orders: orders.count,
          loading: false
        });
      } catch (err) {
        setStats(s => ({ ...s, loading: false }));
      }
    };
    fetchStats();
  }, []);

  if (stats.loading) return <div>Cargando estadísticas...</div>;

  return (
    <div>
      <h1 style={{ fontWeight: 700, fontSize: "2.2rem", marginBottom: "2.5rem", color: "#18181b" }}>
        Dashboard
      </h1>
      <div className="admin-cards" style={{ gap: 32 }}>
        <div className="admin-card" style={{ borderLeft: "6px solid #6366f1" }}>
          <div style={{ fontSize: 32, marginBottom: 8, color: "#6366f1" }}>👤</div>
          <h3 style={{ margin: 0, fontWeight: 600 }}>Usuarios</h3>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0 0" }}>{stats.users}</p>
        </div>
        <div className="admin-card" style={{ borderLeft: "6px solid #22c55e" }}>
          <div style={{ fontSize: 32, marginBottom: 8, color: "#22c55e" }}>📦</div>
          <h3 style={{ margin: 0, fontWeight: 600 }}>Productos</h3>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0 0" }}>{stats.products}</p>
        </div>
        <div className="admin-card" style={{ borderLeft: "6px solid #f59e42" }}>
          <div style={{ fontSize: 32, marginBottom: 8, color: "#f59e42" }}>🧾</div>
          <h3 style={{ margin: 0, fontWeight: 600 }}>Pedidos</h3>
          <p style={{ fontSize: 28, fontWeight: 700, margin: "8px 0 0 0" }}>{stats.orders}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
