import { useEffect, useState, useRef } from "react";

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

      const res = await fetch(`http://localhost:8080/api/users?${params.toString()}`, {
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
    }, 250);
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
      const res = await fetch(`http://localhost:8080/api/users/${editUser._id || editUser.id}`, {
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

  if (loading) return <div>Cargando usuarios...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

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
      const res = await fetch(`http://localhost:8080/api/users/${deleteUser._id || deleteUser.id}`, {
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
    <div className="admin-users-bg">
      <div className="admin-users-wrapper">
        <div className="admin-users-header">
          <h1 className="admin-users-title">Panel de Usuarios</h1>
          <span className="admin-users-count">{totalUsers} usuarios</span>
        </div>
        {/* Controles de búsqueda y filtro */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 18, alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Buscar usuario..."
            value={search}
            onChange={e => {setSearch(e.target.value); setCurrentPage(1);}}
            style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e7ff', minWidth: 180 }}
            autoComplete="off"
            autoFocus 
          />
          <select value={role} onChange={e => { setCurrentPage(1); setRole(e.target.value); }} style={{ padding: 8, borderRadius: 6, border: '1.5px solid #e0e7ff' }}>
            <option value="">Todos los roles</option>
            <option value="admin">Admin</option>
            <option value="user">Usuario</option>
          </select>
        </div>
        <div className="admin-users-tablewrap">
          <table className="admin-table">
            <colgroup>
              <col style={{width:'80px',maxWidth:'90px'}} />
              <col style={{width:'120px'}} />
              <col style={{width:'120px'}} />
              <col style={{width:'180px'}} />
              <col style={{width:'70px'}} />
              <col style={{width:'80px'}} />
              <col style={{width:'110px'}} />
              <col style={{width:'140px'}} />
            </colgroup>
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
              {users.map(u => (
                <tr key={u._id || u.id}>
                  <td className="user-id-cell">
                    <span className="user-id-short" title="Ver ID completo" onClick={() => handleDetails({ ...u, showFullId: true })}>
                      {(u._id || u.id)?.slice(0,8)}... <span className="user-id-vermas">ver más</span>
                    </span>
                  </td>
                  <td>{u.first_name}</td>
                  <td>{u.last_name}</td>
                  <td><span className="user-email">{u.email}</span></td>
                  <td>{u.age}</td>
                  <td><span className={u.role==='admin' ? 'user-role-admin' : 'user-role-user'}>{u.role}</span></td>
                  <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : ''}</td>
                  <td>
                    <div className="admin-actions-row">
                      <button className="edit-btn" onClick={() => handleEditClick(u)}>Editar</button>
                      <button className="delete-btn" onClick={() => handleDelete(u)}>Eliminar</button>
                      <button className="create-btn" style={{padding:'6px 10px'}} onClick={() => handleDetails(u)}>Ver detalles</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', margin: '18px 0 10px 0', flexWrap: 'wrap' }}>
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#6366f1', color: 'white', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.6 : 1 }}>Anterior</button>
          <span style={{ fontWeight: 500 }}>Página {currentPage} de {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(currentPage + 1)} style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: '#6366f1', color: 'white', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.6 : 1 }}>Siguiente</button>
        </div>
        {/* Responsive mobile styles */}
        <style>{`
          @media (max-width: 700px) {
            .admin-table {
              font-size: 0.93rem !important;
            }
            .admin-table th, .admin-table td {
              padding: 7px 3px !important;
            }
            .admin-table colgroup col {
              width: auto !important;
              max-width: 100px !important;
            }
          }
          @media (max-width: 500px) {
            .admin-table {
              font-size: 0.89rem !important;
            }
            .admin-table th, .admin-table td {
              padding: 5px 2px !important;
            }
            .admin-table colgroup col {
              width: auto !important;
              max-width: 70px !important;
            }
            .admin-table td {
              word-break: break-all !important;
            }
          }
        `}</style>
        {/* Modal eliminar usuario */}
        {deleteUser && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-form">
                <h3>Eliminar usuario</h3>
                <p>¿Seguro que deseas eliminar a <b>{deleteUser.first_name} {deleteUser.last_name}</b>?</p>
                <div className="modal-buttons">
                  <button className="delete-btn" onClick={confirmDelete} disabled={deleting}>{deleting ? "Eliminando..." : "Eliminar"}</button>
                  <button className="cancel-btn" onClick={() => setDeleteUser(null)} disabled={deleting}>Cancelar</button>
                </div>
                {modalMsg && <div style={{ marginTop: 8, color: modalMsg.includes("correctamente") ? '#198754' : '#dc3545' }}>{modalMsg}</div>}
              </div>
            </div>
          </div>
        )}

        {/* Modal detalles usuario mejorado y ver ID completo */}
        {detailsUser && (
          <div className="modal-overlay">
            <div className="modal-container">
              <div className="modal-form" style={{gap:18}}>
                <h3 style={{textAlign:'center',marginBottom:8,color:'#6366f1'}}>Detalles del usuario</h3>
                <ul className="admin-users-detailslist">
                  <li className="admin-users-detailsitem">
                    <b>ID:</b> <span style={{color:'#6366f1'}}>{detailsUser.showFullId ? (detailsUser._id || detailsUser.id) : ((detailsUser._id || detailsUser.id)?.slice(0,8)+"...")}</span>
                    {!detailsUser.showFullId && (
                      <span className="user-id-vermas" style={{marginLeft:8}} onClick={()=>setDetailsUser({...detailsUser,showFullId:true})}>ver completo</span>
                    )}
                    {detailsUser.showFullId && (
                      <span className="user-id-vermas" style={{marginLeft:8}} onClick={()=>setDetailsUser({...detailsUser,showFullId:false})}>ocultar</span>
                    )}
                  </li>
                  <li className="admin-users-detailsitem"><b>Nombre:</b> {detailsUser.first_name} {detailsUser.last_name}</li>
                  <li className="admin-users-detailsitem"><b>Email:</b> <span className="user-email">{detailsUser.email}</span></li>
                  <li className="admin-users-detailsitem"><b>Edad:</b> {detailsUser.age}</li>
                  <li className="admin-users-detailsitem"><b>Rol:</b> <span className={detailsUser.role==='admin'?'user-role-admin':'user-role-user'}>{detailsUser.role}</span></li>
                  <li className="admin-users-detailsitem" style={{borderBottom:'none'}}><b>Registrado:</b> {detailsUser.createdAt ? new Date(detailsUser.createdAt).toLocaleString() : ''}</li>
                </ul>
                <div className="modal-buttons" style={{justifyContent:'center'}}>
                  <button style={{
                    background:'#6366f1',
                    color:'white',
                    border:'none',
                    padding:'10px 28px',
                    borderRadius:7,
                    fontWeight:600,
                    fontSize:'1.08rem',
                    letterSpacing:'0.5px',
                    boxShadow:'0 2px 8px #6366f133',
                    cursor:'pointer',
                    transition:'background 0.2s'
                  }}
                    onClick={() => setDetailsUser(null)}
                    onMouseOver={e=>e.currentTarget.style.background='#4f46e5'}
                    onMouseOut={e=>e.currentTarget.style.background='#6366f1'}
                  >Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Modal edición usuario */}
      {editUser && (
        <div className="modal-overlay">
          <div className="modal-container">
            <form className="modal-form" onSubmit={handleEditSave}>
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
              <div className="modal-buttons">
                <button type="submit" className="save-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
                <button type="button" className="cancel-btn" onClick={() => setEditUser(null)} disabled={saving}>Cancelar</button>
              </div>
              {modalMsg && <div style={{ marginTop: 8, color: modalMsg.includes("correctamente") ? '#198754' : '#dc3545' }}>{modalMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
