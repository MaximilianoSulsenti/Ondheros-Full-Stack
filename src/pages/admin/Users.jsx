import { useEffect, useState, useRef } from "react";
import "./Users.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "", age: "", role: "" });
  const [saving, setSaving] = useState(false);
  const [modalMsg, setModalMsg] = useState("");
  const [deleteUser, setDeleteUser] = useState(null);
  const [detailsUser, setDetailsUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  // Estados para paginación, búsqueda y filtro
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const debounceTimeout = useRef(null);
  const [role, setRole] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const adminsInPage = users.filter((u) => u.role === "admin").length;
  const usersInPage = users.filter((u) => u.role !== "admin").length;

  // Handler para mostrar detalles del usuario
  const handleDetails = (user) => {
    setDetailsUser(user);
  };

  // Nueva función para obtener usuarios con paginación, búsqueda y filtro
  const fetchUsers = async ({ page = 1, limit = 10, search = "", role = "" } = {}) => {
    try {
      const token = localStorage.getItem("token");
      const params = new URLSearchParams();
      params.append("page", page);
      params.append("limit", limit);
      if (search) params.append("search", search);
      if (role) params.append("role", role);

      const res = await fetch(`${backendUrl}/api/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Error al obtener usuarios");
      const data = await res.json();
      setUsers(data.payload || []);
      setTotalPages(data.totalPages || 1);
      setCurrentPage(data.page || 1);
      setTotalUsers(data.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Debounce para la búsqueda
  useEffect(() => {
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(debounceTimeout.current);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    fetchUsers({ page: currentPage, search: debouncedSearch, role });
  }, [currentPage, debouncedSearch, role]);

  const handleEditClick = (user) => {
    setEditUser(user);
    setEditForm({
      first_name: user.first_name || user.name || "",
      last_name: user.last_name || "",
      age: user.age || "",
      role: user.role || "user"
    });
    setModalMsg("");
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setModalMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/users/${editUser._id || editUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: editForm.first_name,
          last_name: editForm.last_name,
          age: editForm.age,
          role: editForm.role
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al actualizar usuario");
      setModalMsg("Usuario actualizado correctamente");
      setTimeout(() => {
        setEditUser(null);
        fetchUsers();
      }, 1200);
    } catch (err) {
      setModalMsg(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="users-state">Cargando usuarios...</div>;
  if (error) return <div className="users-state users-state-error">Error: {error}</div>;

  // Eliminar usuario
  const handleDelete = (user) => {
    setDeleteUser(user);
    setModalMsg("");
  };

  const confirmDelete = async () => {
    if (!deleteUser) return;
    setDeleting(true);
    setModalMsg("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${backendUrl}/api/users/${deleteUser._id || deleteUser.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("No se pudo eliminar el usuario");
      setModalMsg("Usuario eliminado correctamente");
      setTimeout(() => {
        setDeleteUser(null);
        fetchUsers();
      }, 1000);
    } catch (err) {
      setModalMsg(err.message);
    } finally {
      setDeleting(false);
    }
  };


  // ...existing code...

  return (
    <section className="users-page">
      <div className="users-wrapper">
        <div className="users-header">
          <h1 className="users-title">Panel de Usuarios</h1>
          <span className="users-count">{totalUsers} usuarios</span>
        </div>

        <div className="users-kpis">
          <article className="users-kpi-card">
            <span>Total visibles</span>
            <strong>{users.length}</strong>
          </article>
          <article className="users-kpi-card">
            <span>Admins</span>
            <strong>{adminsInPage}</strong>
          </article>
          <article className="users-kpi-card">
            <span>Usuarios</span>
            <strong>{usersInPage}</strong>
          </article>
          <article className="users-kpi-card">
            <span>Paginacion</span>
            <strong>{currentPage}/{totalPages}</strong>
          </article>
        </div>

        {/* Controles de búsqueda y filtro */}
        <div className="users-controls">
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => {setSearch(e.target.value); setCurrentPage(1);}}
            className="users-search"
            autoComplete="off"
            autoFocus 
          />
          <select value={role} onChange={e => { setCurrentPage(1); setRole(e.target.value); }} className="users-role-filter">
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="user">Usuario</option>
          </select>
        </div>

        <div className="users-table-wrap">
          <table className="admin-table users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Email</th>
                <th>Edad</th>
                <th>Rol</th>
                <th>Registrado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="users-empty-row">No se encontraron usuarios con los filtros actuales.</td>
                </tr>
              ) : (
              users.map(u => (
                <tr key={u._id || u.id}>
                  <td className="users-id-cell">
                    <span className="users-id-short" title="Ver ID completo" onClick={() => handleDetails({ ...u, showFullId: true })}>
                      {(u._id || u.id)?.slice(0,8)}... <span className="users-id-more">ver más</span>
                    </span>
                  </td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td><span className="users-email">{u.email}</span></td>
                  <td>{u.age}</td>
                  <td><span className={u.role==='admin' ? 'users-role-admin' : 'users-role-user'}>{u.role}</span></td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    <div className="users-actions-row">
                      <button className="users-btn users-btn-edit" onClick={() => handleEditClick(u)}>Editar</button>
                      <button className="users-btn users-btn-delete" onClick={() => handleDelete(u)}>Eliminar</button>
                      <button className="users-btn users-btn-details" onClick={() => handleDetails(u)}>Ver detalles</button>
                    </div>
                  </td>
                </tr>
              ))
              )}
            </tbody>
          </table>
        </div>

        <div className="users-cards-mobile">
          {users.length === 0 ? (
            <div className="users-empty-row">No se encontraron usuarios con los filtros actuales.</div>
          ) : (
            users.map((u) => (
              <article className="users-mobile-card" key={`mobile-${u._id || u.id}`}>
                <div className="users-mobile-card-head">
                  <div>
                    <p className="users-mobile-name">{u.first_name} {u.last_name}</p>
                    <p className="users-mobile-email">{u.email}</p>
                  </div>
                  <span className={u.role === "admin" ? "users-role-admin" : "users-role-user"}>{u.role}</span>
                </div>

                <div className="users-mobile-meta">
                  <span><b>ID:</b> {(u._id || u.id)?.slice(0, 8)}...</span>
                  <span><b>Edad:</b> {u.age || "-"}</span>
                  <span><b>Registro:</b> {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "-"}</span>
                </div>

                <div className="users-actions-row">
                  <button className="users-btn users-btn-edit" onClick={() => handleEditClick(u)}>Editar</button>
                  <button className="users-btn users-btn-delete" onClick={() => handleDelete(u)}>Eliminar</button>
                  <button className="users-btn users-btn-details" onClick={() => handleDetails(u)}>Ver detalles</button>
                </div>
              </article>
            ))
          )}
        </div>

        {/* Paginación */}
        <div className="users-pagination-row">
          <button className="users-pagination-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>Anterior</button>
          <span className="users-pagination-label">Página {currentPage} de {totalPages}</span>
          <button className="users-pagination-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)}>Siguiente</button>
        </div>

        {/* Modal eliminar usuario */}
        {deleteUser && (
          <div className="users-modal-overlay">
            <div className="users-modal-container">
              <div className="users-modal-form">
                <h3>Eliminar usuario</h3>
                <p>¿Seguro que deseas eliminar a <b>{deleteUser.first_name} {deleteUser.last_name}</b>?</p>
                <div className="users-modal-buttons">
                  <button className="users-btn users-btn-delete" onClick={confirmDelete} disabled={deleting}>{deleting ? "Eliminando..." : "Eliminar"}</button>
                  <button className="users-btn users-btn-cancel" onClick={() => setDeleteUser(null)} disabled={deleting}>Cancelar</button>
                </div>
                {modalMsg && <div className={`users-modal-msg ${modalMsg.includes("correctamente") ? "is-success" : "is-error"}`}>{modalMsg}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Modal detalles usuario mejorado y ver ID completo */}
        {detailsUser && (
          <div className="users-modal-overlay">
            <div className="users-modal-container">
              <div className="users-modal-form users-details-form">
                <h3 className="users-details-title">Detalles del usuario</h3>
                <ul className="users-details-list">
                  <li className="users-details-item">
                    <b>ID:</b> <span style={{color:'#6366f1'}}>{detailsUser.showFullId ? (detailsUser._id || detailsUser.id) : ((detailsUser._id || detailsUser.id)?.slice(0,8)+"...")}</span>
                    {!detailsUser.showFullId && (
                      <span className="users-id-more" style={{marginLeft:8}} onClick={()=>setDetailsUser({...detailsUser,showFullId:true})}>ver completo</span>
                    )}
                    {detailsUser.showFullId && (
                      <span className="users-id-more" style={{marginLeft:8}} onClick={()=>setDetailsUser({...detailsUser,showFullId:false})}>ocultar</span>
                    )}
                  </li>
                  <li className="users-details-item"><b>Nombre:</b> {detailsUser.first_name} {detailsUser.last_name}</li>
                  <li className="users-details-item"><b>Email:</b> <span className="users-email">{detailsUser.email}</span></li>
                  <li className="users-details-item"><b>Edad:</b> {detailsUser.age}</li>
                  <li className="users-details-item"><b>Rol:</b> <span className={detailsUser.role==='admin'?'users-role-admin':'users-role-user'}>{detailsUser.role}</span></li>
                  <li className="users-details-item"><b>Registrado:</b> {detailsUser.createdAt ? new Date(detailsUser.createdAt).toLocaleString() : ''}</li>
                </ul>
                <div className="users-modal-buttons users-modal-buttons-center">
                  <button className="users-btn users-btn-close" onClick={() => setDetailsUser(null)}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal edición usuario */}
      {editUser && (
        <div className="users-modal-overlay">
          <div className="users-modal-container">
            <form className="users-modal-form" onSubmit={handleEditSave}>
              <h3>Editar usuario</h3>
              <label>Nombre:
                <input name="first_name" value={editForm.first_name} onChange={handleEditChange} required />
              </label>
              <label>Apellido:
                <input name="last_name" value={editForm.last_name} onChange={handleEditChange} required />
              </label>
              <label>Edad:
                <input name="age" type="number" min="1" value={editForm.age} onChange={handleEditChange} required />
              </label>
              <label>Rol:
                <select name="role" value={editForm.role} onChange={handleEditChange} required>
                  <option value="user">Usuario</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <div className="users-modal-buttons">
                <button type="submit" className="users-btn users-btn-save" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
                <button type="button" className="users-btn users-btn-cancel" onClick={() => setEditUser(null)} disabled={saving}>Cancelar</button>
              </div>
              {modalMsg && <div className={`users-modal-msg ${modalMsg.includes("correctamente") ? "is-success" : "is-error"}`}>{modalMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Users;
