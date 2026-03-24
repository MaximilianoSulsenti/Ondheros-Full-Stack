import { useEffect, useState } from "react";
import { useAuth } from "../Context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user: userContext } = useAuth();
  const [user, setUser] = useState(userContext);
  const [loading, setLoading] = useState(true);

  // Edición de perfil
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editImg, setEditImg] = useState("");
  const [imgPreview, setImgPreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  // Modales para email y contraseña
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);

  // Email
  const [newEmail, setNewEmail] = useState("");
  const [currentPassForEmail, setCurrentPassForEmail] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Contraseña
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:8080/api/users/" + userContext?._id, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.payload);
        }
      } catch (e) {
        setUser(userContext);
      } finally {
        setLoading(false);
      }
    };
    if (userContext?._id) fetchProfile();
    else setLoading(false);
  }, [userContext]);

   // Autocompletar email al abrir modal
  useEffect(() => {
    if (showEmailModal) {
      setNewEmail(user?.email || "");
      setCurrentPassForEmail("");
      setEmailMsg("");
    }
  }, [showEmailModal, user]);
  
  // Edición de nombre/avatar
  const handleEdit = () => {
    setEditName(user?.first_name || "");
    setEditImg(user?.img || "");
    setImgPreview(user?.img || "");
    setShowEdit(true);
  };

  const handleImgChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setImgPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg("");
    if (!user || !user._id) {
      setSaveMsg("Error: usuario no válido.");
      setSaving(false);
      setShowEdit(false);
      setTimeout(() => setSaveMsg(""), 2500);
      return;
    }
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ first_name: editName, img: imgPreview })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.payload);
        setSaveMsg("¡Perfil actualizado!");
      } else {
        setUser((prev) => ({ ...prev, first_name: editName, img: imgPreview }));
        setSaveMsg("Guardado local, pero hubo un error en el servidor.");
      }
    } catch (err) {
      setUser((prev) => ({ ...prev, first_name: editName, img: imgPreview }));
      setSaveMsg("Guardado local, pero hubo un error de conexión.");
    } finally {
      setSaving(false);
      setShowEdit(false);
      setTimeout(() => setSaveMsg(""), 2500);
    }
  };

  // Cambiar email
  const handleEmailChange = async (e) => {
    e.preventDefault();
    setEmailLoading(true);
    setEmailMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user._id}/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail, currentPassword: currentPassForEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setUser((prev) => ({ ...prev, email: newEmail }));
        setEmailMsg("¡Email actualizado!");
        setShowEmailModal(false);
      } else {
        setEmailMsg(data.error || "Error al actualizar email");
      }
    } catch {
      setEmailMsg("Error de conexión");
    } finally {
      setEmailLoading(false);
      setTimeout(() => setEmailMsg(""), 2500);
    }
  };

  // Cambiar contraseña
  const handlePassChange = async (e) => {
    e.preventDefault();
    setPassLoading(true);
    setPassMsg("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:8080/api/users/${user._id}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword: currentPass, newPassword: newPass })
      });
      const data = await res.json();
      if (res.ok) {
        setPassMsg("¡Contraseña actualizada!");
        setShowPassModal(false);
      } else {
        setPassMsg(data.error || "Error al actualizar contraseña");
      }
    } catch {
      setPassMsg("Error de conexión");
    } finally {
      setPassLoading(false);
      setTimeout(() => setPassMsg(""), 2500);
    }
  };

  if (loading) return <div className="profile-loading">Cargando perfil...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className={`profile-avatar profile-avatar-anim`}>
          {user?.img || imgPreview ? (
            <img src={user?.img || imgPreview} alt="avatar" className="profile-img" />
          ) : (
            <span>{user?.first_name?.[0]?.toUpperCase() || "U"}</span>
          )}
        </div>
        <h2 className="profile-title">Perfil de usuario</h2>
        <div className="profile-info">
          <div className="profile-row">
            <span className="profile-label">Nombre:</span>
            <span className="profile-value">{user?.first_name}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Email:</span>
            <span className="profile-value">{user?.email}</span>
            <button className="profile-action-btn" onClick={() => setShowEmailModal(true)}>Editar email</button>
          </div>
          <div className="profile-row">
            <span className="profile-label">Rol:</span>
            <span className="profile-value profile-role">{user?.role}</span>
          </div>
          <div className="profile-row">
            <span className="profile-label">Contraseña:</span>
            <span className="profile-value">********</span>
            <button className="profile-action-btn" onClick={() => setShowPassModal(true)}>Cambiar contraseña</button>
          </div>
        </div>
        <button className="profile-edit-btn" onClick={handleEdit} disabled={saving}>
          {saving ? "Guardando..." : "Editar perfil"}
        </button>
        {saveMsg && <div className="profile-save-msg">{saveMsg}</div>}
        {/* Modal editar nombre/avatar */}
        {showEdit && (
          <div className="profile-modal-overlay profile-modal-fadein">
            <div className="profile-modal">
              <form className="profile-edit-form" onSubmit={handleSave}>
                <label>Nombre:
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                </label>
                <label className="profile-file-label">Foto de perfil:
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImgChange}
                    className="profile-file-input"
                  />
                  <span className="profile-file-btn">Seleccionar archivo</span>
                  {imgPreview && <span className="profile-file-name">Imagen lista para guardar</span>}
                </label>
                {imgPreview && <img src={imgPreview} alt="preview" className="profile-img-preview profile-img-fadein" />}
                <div className="profile-edit-actions">
                  <button type="submit" className="profile-save-btn" disabled={saving}>{saving ? "Guardando..." : "Guardar"}</button>
                  <button type="button" className="profile-cancel-btn" onClick={() => setShowEdit(false)} disabled={saving}>Cancelar</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Modal cambiar email */}
        {showEmailModal && (
          <div className="profile-modal-overlay profile-modal-fadein">
            <div className="profile-modal">
              <form className="profile-edit-form" onSubmit={handleEmailChange}>
                <label>Nuevo email:
                  <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                </label>
                <label>Contraseña actual:
                  <input type="password" value={currentPassForEmail} onChange={e => setCurrentPassForEmail(e.target.value)} required />
                </label>
                <div className="profile-edit-actions">
                  <button type="submit" className="profile-save-btn" disabled={emailLoading}>{emailLoading ? "Guardando..." : "Guardar"}</button>
                  <button type="button" className="profile-cancel-btn" onClick={() => setShowEmailModal(false)} disabled={emailLoading}>Cancelar</button>
                </div>
                {emailMsg && <div className="profile-save-msg">{emailMsg}</div>}
              </form>
            </div>
          </div>
        )}
        {/* Modal cambiar contraseña */}
        {showPassModal && (
          <div className="profile-modal-overlay profile-modal-fadein">
            <div className="profile-modal">
              <form className="profile-edit-form" onSubmit={handlePassChange}>
                <label>Contraseña actual:
                  <input type="password" value={currentPass} onChange={e => setCurrentPass(e.target.value)} required />
                </label>
                <label>Nueva contraseña:
                  <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} required />
                </label>
                <div className="profile-edit-actions">
                  <button type="submit" className="profile-save-btn" disabled={passLoading}>{passLoading ? "Guardando..." : "Guardar"}</button>
                  <button type="button" className="profile-cancel-btn" onClick={() => setShowPassModal(false)} disabled={passLoading}>Cancelar</button>
                </div>
                {passMsg && <div className="profile-save-msg">{passMsg}</div>}
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;