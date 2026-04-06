import React, { useState, useEffect, useRef } from "react";
// Helpers para favoritos en localStorage
const FAVORITES_KEY = "newsletterFavorites";
function getFavorites() {
  try {
    const favs = localStorage.getItem(FAVORITES_KEY);
    return favs ? JSON.parse(favs) : [];
  } catch { return []; }
}
function saveFavorites(favs) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
}
import Select from "react-select";
import "./NewsletterForm.css";

export default function NewsletterForm() {
  // Segmentación: roles y emails
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites());
  const [favName, setFavName] = useState("");
  const SELECT_ALL_OPTION = { value: '__all__', label: 'Seleccionar todos' };
  const [selectAll, setSelectAll] = useState(false);
  // Filtros y búsqueda avanzada
  const [search, setSearch] = useState("");
  // Por defecto, aplicar ambos filtros: activos y verificados
  const [filter, setFilter] = useState("activos-verificados");
  // Debounce para búsqueda
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timeout);
  }, [search]);
      // Obtener roles al montar
      useEffect(() => {
        const fetchRoles = async () => {
          try {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:8080/api/admin/newsletter/segments", {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data.roles)) {
              setRoles(data.roles.map(r => ({ value: r, label: r })));
            }
          } catch {}
        };
        fetchRoles();
      }, []);

      // Obtener emails al cambiar el rol, filtro o búsqueda
      useEffect(() => {
        if (!selectedRole) {
          setEmails([]);
          setSelectedEmails([]);
          return;
        }
        const fetchEmails = async () => {
          try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            params.append("role", selectedRole.value);
            if (filter) params.append("filter", filter);
            if (debouncedSearch) params.append("search", debouncedSearch);
            const res = await fetch(`http://localhost:8080/api/admin/newsletter/segments?${params.toString()}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok && Array.isArray(data.emails)) {
              const emailOptions = data.emails.map(e => ({ value: e, label: e }));
              setEmails(emailOptions.length > 0 ? [SELECT_ALL_OPTION, ...emailOptions] : []);
              setSelectedEmails([]);
            } else {
              setEmails([]);
            }
          } catch {
            setEmails([]);
          }
        };
        fetchEmails();
      }, [selectedRole, filter, debouncedSearch]);

      // Si cambia la lista de emails y está activado seleccionar todos, selecciona todos
      useEffect(() => {
        if (selectAll && emails.length > 0) {
          setSelectedEmails(emails);
        }
      }, [emails, selectAll]);
    // Archivos adjuntos
    const [attachments, setAttachments] = useState([]);

    const MAX_FILE_SIZE_MB = 10;
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'
    ];
    const handleFileChange = (e) => {
      const files = Array.from(e.target.files);
      const validFiles = [];
      for (const file of files) {
        if (!ALLOWED_TYPES.includes(file.type)) {
          alert(`El archivo ${file.name} no es un tipo permitido.`);
          continue;
        }
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          alert(`El archivo ${file.name} supera el tamaño máximo de ${MAX_FILE_SIZE_MB}MB.`);
          continue;
        }
        validFiles.push(file);
      }
      setAttachments(validFiles);
    };

    const handleRemoveAttachment = (idx) => {
      setAttachments(attachments.filter((_, i) => i !== idx));
    };
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  // Plantillas rápidas (almacenadas en localStorage)
  // Borrador (almacenado en localStorage)
    useEffect(() => {
      // Al cargar, restaurar borrador si existe
      const savedDraft = localStorage.getItem("newsletterDraft");
      if (savedDraft) {
        try {
          const { subject: s, text: t } = JSON.parse(savedDraft);
          if (s || t) {
            setSubject(s || "");
            setText(t || "");
          }
        } catch {}
      }
    }, []);

    // Guardar borrador automáticamente al cambiar subject o text
    useEffect(() => {
      localStorage.setItem("newsletterDraft", JSON.stringify({ subject, text }));
    }, [subject, text]);

    // Guardar borrador manual
    const handleSaveDraft = () => {
      localStorage.setItem("newsletterDraft", JSON.stringify({ subject, text }));
      alert("Borrador guardado");
    };

    // Limpiar borrador
    const handleClearDraft = () => {
      localStorage.removeItem("newsletterDraft");
      setSubject("");
      setText("");
      alert("Borrador eliminado");
    };
  const [templates, setTemplates] = useState(() => {
    try {
      const saved = localStorage.getItem("newsletterTemplates");
      return saved ? JSON.parse(saved) : [
        { name: "Bienvenida", subject: "¡Bienvenido a nuestra comunidad!", text: "Hola *{nombre}*,\n\nGracias por unirte a Ondheros.\n\n**¡Esperamos que disfrutes la experiencia!**" },
        { name: "Promo especial", subject: "Oferta exclusiva para vos", text: "¡Aprovechá nuestra promo solo por hoy!\n\n*Descuento del 20% en toda la tienda.*" }
      ];
    } catch {
      return [];
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  // Programar envío
  const [scheduledAt, setScheduledAt] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validación: debe haber al menos un email seleccionado
    if (!selectedRole || selectedEmails.length === 0) {
      setMsg("Debes seleccionar al menos un email destinatario.");
      return;
    }
    setLoading(true);
    setMsg("");
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("text", text);
      if (selectedRole) formData.append("role", selectedRole.value);
      if (selectedEmails.length > 0) {
        selectedEmails.forEach(e => formData.append("emails", e.value));
      }
      // Solo enviar archivos, nunca el array como string ni como campo de texto
      attachments.forEach(file => {
        formData.append("attachments", file);
      });
      if (scheduledAt) {
        formData.append("scheduledAt", scheduledAt);
      }
      const res = await fetch("http://localhost:8080/api/admin/newsletter", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(scheduledAt ? "¡Newsletter programado!" : "¡Newsletter enviado!");
        setSubject("");
        setText("");
        setAttachments([]);
        setSelectedRole(null);
        setSelectedEmails([]);
        setScheduledAt("");
      } else {
        setMsg(data.error || "Error al enviar newsletter");
      }
    } catch {
      setMsg("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  // Manejar selección de plantilla
  const handleTemplateChange = (e) => {
    const idx = e.target.value;
    setSelectedTemplate(idx);
    if (idx !== "") {
      setSubject(templates[idx].subject);
      setText(templates[idx].text);
    }
  };

  // Guardar plantilla actual
  const handleSaveTemplate = () => {
    const name = prompt("Nombre para la plantilla:");
    if (!name) return;
    const newTemplates = [...templates, { name, subject, text }];
    setTemplates(newTemplates);
    localStorage.setItem("newsletterTemplates", JSON.stringify(newTemplates));
    setSelectedTemplate("");
    alert("Plantilla guardada");
  };

  // Eliminar plantilla seleccionada
  const handleDeleteTemplate = () => {
    if (selectedTemplate === "") return;
    if (!window.confirm("¿Seguro que deseas eliminar esta plantilla?")) return;
    const idx = parseInt(selectedTemplate, 10);
    const newTemplates = templates.filter((_, i) => i !== idx);
    setTemplates(newTemplates);
    localStorage.setItem("newsletterTemplates", JSON.stringify(newTemplates));
    setSelectedTemplate("");
    alert("Plantilla eliminada");
  };

  return (
    <>
      <form className="newsletter-form-container" onSubmit={handleSubmit}>
        <h2 className="newsletter-form-title">Enviar newsletter</h2>
        {/* Segmentación: rol y emails */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ minWidth: 200 }}>
            <label style={{ fontWeight: 500, color: '#3730a3', marginBottom: 4, display: 'block' }}>Rol destinatario</label>
            <Select
              options={roles}
              value={selectedRole}
              onChange={setSelectedRole}
              placeholder="Seleccionar rol..."
              isClearable
              noOptionsMessage={() => "Sin roles"}
            />
          </div>
          <div style={{ minWidth: 300 }}>
            <label style={{ fontWeight: 500, color: '#3730a3', marginBottom: 4, display: 'block' }}>Emails destinatarios</label>
            {/* Filtros rápidos y búsqueda avanzada */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                style={{ padding: '2px 8px', borderRadius: 8, border: '1px solid #e0e7ef', fontSize: '0.93rem', minWidth: 120 }}
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={!selectedRole || emails.length === 0}
              />
              <select
                style={{ padding: '2px 8px', borderRadius: 8, border: '1px solid #e0e7ef', fontSize: '0.93rem' }}
                value={filter}
                onChange={e => setFilter(e.target.value)}
                disabled={!selectedRole || emails.length === 0}
              >
                <option value="">Todos</option>
                <option value="activos">Solo activos</option>
                <option value="verificados">Solo verificados</option>
                <option value="activos-verificados">Activos y verificados</option>
                {/* Agrega más filtros según el backend */}
              </select>
            </div>
            <Select
              options={emails}
              value={selectedEmails}
              onChange={(vals, action) => {
                if (Array.isArray(vals)) {
                  const hasSelectAll = vals.some(v => v.value === SELECT_ALL_OPTION.value);
                  if (hasSelectAll) {
                    if (selectedEmails.length !== emails.length - 1) {
                      setSelectedEmails(emails.filter(e => e.value !== SELECT_ALL_OPTION.value));
                    } else {
                      setSelectedEmails([]);
                    }
                  } else {
                    setSelectedEmails(vals);
                  }
                  // (No forzar cierre del menú)
                } else {
                  setSelectedEmails([]);
                }
              }}
              isMulti
              isDisabled={!selectedRole || emails.length === 0}
              placeholder={selectedRole ? (emails.length ? "Seleccionar emails..." : "Sin emails para este rol") : "Selecciona un rol primero"}
              noOptionsMessage={() => "Sin emails"}
              closeMenuOnSelect={false}
            />
            {/* Mensaje visual si no hay emails para mostrar */}
            {selectedRole && emails.length === 0 && (
              <div style={{ color: '#ef4444', fontWeight: 500, marginTop: 6 }}>
                No se encontraron usuarios con estos filtros.
              </div>
            )}
            {/* Contador de seleccionados */}
            <div style={{ fontSize: '0.92rem', color: '#6366f1', marginTop: 4, minHeight: 20 }}>
              {selectedRole && emails.length > 1 && (
                <>
                  {selectedEmails.length} de {emails.length - 1} seleccionados
                </>
              )}
            </div>
            {/* Resumen visual de destinatarios y favoritos */}
            {selectedEmails.length > 0 && (
              <>
                {selectedEmails.length > 100 && (
                  <div style={{ color: '#ef4444', fontWeight: 600, marginBottom: 4, fontSize: '0.97rem' }}>
                    ¡Advertencia! Estás seleccionando más de 100 destinatarios. El envío puede demorar o fallar según el proveedor.
                  </div>
                )}
                <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
                  {selectedEmails.map(e => (
                    <span key={e.value} style={{ background: '#e0e7ef', color: '#3730a3', borderRadius: 12, padding: '2px 10px', fontSize: '0.93rem', fontWeight: 500 }}>
                      {e.label}
                    </span>
                  ))}
                  <button
                    type="button"
                    style={{ marginLeft: 8, padding: '2px 10px', borderRadius: 8, border: '1px solid #e0e7ef', background: '#fff', color: '#3730a3', fontWeight: 500, fontSize: '0.93rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Copiar emails al portapapeles"
                    onClick={() => {
                      const emailsStr = selectedEmails.map(e => e.value).join(", ");
                      navigator.clipboard.writeText(emailsStr);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1200);
                    }}
                  >
                    {copied ? "¡Copiado!" : "Copiar"}
                  </button>
                  <button
                    type="button"
                    style={{ marginLeft: 4, padding: '2px 10px', borderRadius: 8, border: '1px solid #e0e7ef', background: '#fff', color: '#ef4444', fontWeight: 500, fontSize: '0.93rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Deshacer selección de emails"
                    onClick={() => setSelectedEmails([])}
                  >
                    Deshacer
                  </button>
                  {/* Guardar como favorito */}
                  <input
                    type="text"
                    value={favName}
                    onChange={e => setFavName(e.target.value)}
                    placeholder="Nombre grupo"
                    style={{ marginLeft: 8, padding: '2px 8px', borderRadius: 8, border: '1px solid #e0e7ef', fontSize: '0.93rem', minWidth: 90 }}
                  />
                  <button
                    type="button"
                    style={{ marginLeft: 4, padding: '2px 10px', borderRadius: 8, border: '1px solid #e0e7ef', background: '#10b981', color: '#fff', fontWeight: 500, fontSize: '0.93rem', cursor: 'pointer', transition: 'all 0.2s' }}
                    title="Guardar grupo favorito"
                    disabled={!favName || selectedEmails.length === 0}
                    onClick={() => {
                      if (!favName) return;
                      const newFavs = [...favorites, { name: favName, emails: selectedEmails.map(e => e.value) }];
                      setFavorites(newFavs);
                      saveFavorites(newFavs);
                      setFavName("");
                    }}
                  >
                    Guardar grupo
                  </button>
                </div>
              </>
            )}
            {/* Listado de favoritos */}
            {favorites.length > 0 && (
              <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <span style={{ color: '#6366f1', fontWeight: 500, fontSize: '0.93rem' }}>Favoritos:</span>
                {favorites.map((fav, i) => (
                  <button
                    key={fav.name + i}
                    type="button"
                    style={{ background: '#f3f4f6', color: '#3730a3', border: '1px solid #e0e7ef', borderRadius: 8, padding: '2px 10px', fontWeight: 500, fontSize: '0.93rem', cursor: 'pointer' }}
                    title={`Seleccionar grupo: ${fav.name}`}
                    onClick={() => {
                      // Solo selecciona los emails que estén en la lista actual
                      setSelectedEmails(emails.filter(e => fav.emails.includes(e.value)));
                    }}
                  >
                    {fav.name}
                  </button>
                ))}
                {/* Botón para limpiar favoritos */}
                <button
                  type="button"
                  style={{ background: '#fff', color: '#ef4444', border: '1px solid #e0e7ef', borderRadius: 8, padding: '2px 10px', fontWeight: 500, fontSize: '0.93rem', cursor: 'pointer' }}
                  title="Eliminar todos los favoritos"
                  onClick={() => { setFavorites([]); saveFavorites([]); }}
                >
                  Limpiar favoritos
                </button>
              </div>
            )}
          </div>
          </div>
        {/* Plantillas rápidas y borrador */}
        <div style={{ marginBottom: 16, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            style={{ padding: '0.4rem', borderRadius: 6, border: '1px solid #e0e7ef', minWidth: 180 }}
          >
            <option value="">Seleccionar plantilla rápida...</option>
            {templates.map((tpl, idx) => (
              <option key={tpl.name + idx} value={idx}>{tpl.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveTemplate}
            style={{ background: '#6366f1', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 500 }}
          >
            Guardar como plantilla
          </button>
          <button
            type="button"
            onClick={handleDeleteTemplate}
            disabled={selectedTemplate === ""}
            style={{ background: '#ef4444', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: selectedTemplate === "" ? 'not-allowed' : 'pointer', fontWeight: 500, opacity: selectedTemplate === "" ? 0.5 : 1 }}
          >
            Eliminar plantilla
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            style={{ background: '#10b981', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 500 }}
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={handleClearDraft}
            style={{ background: '#f59e42', color: '#fff', border: 'none', borderRadius: 6, padding: '0.4rem 0.8rem', cursor: 'pointer', fontWeight: 500 }}
          >
            Limpiar borrador
          </button>
        </div>
        <label className="newsletter-form-label" htmlFor="newsletter-subject">Asunto</label>
        <input
          id="newsletter-subject"
          className="newsletter-form-input"
          type="text"
          placeholder="Asunto"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          required
        />
        <div style={{ fontSize: '0.92rem', color: '#6366f1', marginBottom: 8, textAlign: 'right' }}>
          {subject.length} / 100 caracteres
        </div>
        <label className="newsletter-form-label" htmlFor="newsletter-text">Mensaje</label>
        <textarea
          id="newsletter-text"
          className="newsletter-form-textarea"
          placeholder="Mensaje"
          value={text}
          onChange={e => setText(e.target.value)}
          required
          rows={6}
        />
        <div style={{ fontSize: '0.92rem', color: '#6366f1', marginBottom: 8, textAlign: 'right' }}>
          {text.length} / 1000 caracteres
        </div>
        {/* Adjuntar archivos debajo del mensaje */}
        <div className="newsletter-attachments">
          <span className="newsletter-attachments-label">Adjuntar archivos (imágenes o PDF):</span>
          <label htmlFor="newsletter-file-input" className="newsletter-file-btn">
            Elegir archivos
            <input
              id="newsletter-file-input"
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </label>
          {attachments.length > 0 && (
            <ul>
              {attachments.map((file, idx) => (
                <li key={file.name + idx}>
                  <span>{file.name}</span>
                  <button type="button" onClick={() => handleRemoveAttachment(idx)}>
                    Quitar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Programar envío */}
        <div style={{ margin: '16px 0 8px 0' }}>
          <label style={{ fontWeight: 500, color: '#3730a3', marginBottom: 4, display: 'block' }}>
            Programar envío (opcional):
          </label>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={e => {
              // Convertir a UTC antes de guardar en el estado
              const local = new Date(e.target.value);
              const utc = new Date(local.getTime() - local.getTimezoneOffset() * 60000);
              setScheduledAt(utc.toISOString().slice(0, 16));
            }}
            style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #e0e7ef', fontSize: '0.93rem' }}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)}
          />
        </div>
        <button type="submit" className="newsletter-form-btn" disabled={loading}>
          {loading ? (scheduledAt ? "Programando..." : "Enviando...") : (scheduledAt ? "Programar envío" : "Enviar newsletter")}
        </button>
        {msg && <div className="newsletter-form-msg">{msg}</div>}
      </form>
      {/* Vista previa en vivo tipo email real */}
      <div style={{
        maxWidth: 480,
        margin: "1.5rem auto 0 auto",
        background: "#f8fafc",
        border: "1px solid #e0e7ef",
        borderRadius: 10,
        boxShadow: "0 1px 8px rgba(60,60,60,0.06)",
        padding: "1.2rem 1rem"
      }}>
        <div style={{ color: "#6366f1", fontWeight: 700, fontSize: "1.1rem", marginBottom: 6 }}>Vista previa tipo email</div>
        <div style={{
          background: '#fff',
          border: '1px solid #e0e7ef',
          borderRadius: 8,
          padding: '1rem',
          minHeight: 80,
          fontFamily: 'Segoe UI, Arial, sans-serif',
          color: '#222',
          boxShadow: '0 1px 4px rgba(60,60,60,0.04)'
        }}>
          <div style={{ color: '#3730a3', fontWeight: 600, fontSize: '1.05rem', marginBottom: 8 }}>
            {subject || <span style={{ color: '#a3a3a3' }}>[Asunto]</span>}
          </div>
          <div
            style={{ fontSize: '1rem', lineHeight: 1.6, minHeight: 60 }}
            dangerouslySetInnerHTML={{
              __html: text
                ? text
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.*?)\*/g, '<i>$1</i>')
                : '<span style="color:#a3a3a3">[Mensaje]</span>'
            }}
          />
        </div>
      </div>
    </>
  );
}