import React, { useState, useEffect } from "react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import "./NewsletterForm.css";

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

const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function NewsletterForm() {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState(getFavorites());
  const [favName, setFavName] = useState("");
  const SELECT_ALL_OPTION = { value: '__all__', label: 'Seleccionar todos' };
  // Filtros y búsqueda avanzada
  const [search, setSearch] = useState("");
  // Por defecto, aplicar ambos filtros: activos y verificados
  const [filter, setFilter] = useState("activos-verificados");
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
            const res = await fetch(`${backendUrl}/api/admin/newsletter/segments`, {
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
          setSearch("");
          setFilter("activos-verificados");
          return;
        }
        const fetchEmails = async () => {
          try {
            const token = localStorage.getItem("token");
            const params = new URLSearchParams();
            params.append("role", selectedRole.value);
            if (filter) params.append("filter", filter);
            if (debouncedSearch) params.append("search", debouncedSearch);
            const res = await fetch(`${backendUrl}/api/admin/newsletter/segments?${params.toString()}`, {
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

      useEffect(() => {
        if (selectedRole) {
          setSearch("");
          setFilter("activos-verificados");
          setSelectedEmails([]);
        }
      }, [selectedRole?.value]);

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
  const isErrorMsg = msg.toLowerCase().includes("error") || msg.toLowerCase().includes("debes");
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
      const res = await fetch(`${backendUrl}/api/admin/newsletter`, {
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
    <div className="newsletter-layout">
      <form className="newsletter-form-container" onSubmit={handleSubmit}>
        <h2 className="newsletter-form-title">Enviar newsletter</h2>
        <div className="newsletter-kpi-row">
          <span className="newsletter-kpi-pill">
            Destinatarios: {selectedEmails.length}
          </span>
          <span className="newsletter-kpi-pill">
            Adjuntos: {attachments.length}
          </span>
          {scheduledAt && (
            <span className="newsletter-kpi-pill is-scheduled">
              Programado
            </span>
          )}
        </div>
        {/* Segmentación: rol y emails */}
        <div className="newsletter-segmentation">
          <div className="newsletter-segment-role">
            <label className="newsletter-inline-label">Rol destinatario</label>
            <Select
              options={roles}
              value={selectedRole}
              onChange={setSelectedRole}
              placeholder="Seleccionar rol..."
              isClearable
              classNamePrefix="newsletter-select"
              noOptionsMessage={() => "Sin roles"}
            />
          </div>
          <div className="newsletter-segment-emails">
            <label className="newsletter-inline-label">Emails destinatarios</label>
            {/* Filtros rápidos y búsqueda avanzada */}
            <div className="newsletter-inline-filters">
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                className="newsletter-mini-input"
                value={search}
                onChange={e => setSearch(e.target.value)}
                disabled={!selectedRole}
              />
              <select
                className="newsletter-mini-select"
                value={filter}
                onChange={e => setFilter(e.target.value)}
                disabled={!selectedRole}
              >
                <option value="">Todos</option>
                <option value="activos">Solo activos</option>
                <option value="verificados">Solo verificados</option>
                <option value="activos-verificados">Activos y verificados</option>
                {/* Agrega más filtros según el backend */}
              </select>
            </div>
            <CreatableSelect
              options={emails}
              value={selectedEmails}
              onChange={(vals) => {
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
              onCreateOption={(inputValue) => {
                const normalized = inputValue.trim().toLowerCase();
                if (!isValidEmail(normalized)) return;
                const existsInSelected = selectedEmails.some(e => String(e.value).toLowerCase() === normalized);
                if (existsInSelected) return;
                setSelectedEmails((prev) => [...prev, { value: normalized, label: normalized }]);
              }}
              isMulti
              isSearchable
              isClearable
              backspaceRemovesValue
              isDisabled={!selectedRole}
              isValidNewOption={(inputValue, _, options) => {
                const normalized = inputValue.trim().toLowerCase();
                if (!isValidEmail(normalized)) return false;
                const existsInOptions = options.some(o => String(o.value).toLowerCase() === normalized);
                const existsInSelected = selectedEmails.some(o => String(o.value).toLowerCase() === normalized);
                return !existsInOptions && !existsInSelected;
              }}
              formatCreateLabel={(inputValue) => `Agregar: ${inputValue}`}
              placeholder={selectedRole ? (emails.length ? "Seleccionar emails..." : "Sin emails para este rol") : "Selecciona un rol primero"}
              noOptionsMessage={() => "Sin emails"}
              classNamePrefix="newsletter-select"
              closeMenuOnSelect={false}
            />
            {/* Mensaje visual si no hay emails para mostrar */}
            {selectedRole && emails.length === 0 && (
              <div className="newsletter-inline-error">
                No se encontraron usuarios con estos filtros.
              </div>
            )}
            {/* Contador de seleccionados */}
            <div className="newsletter-counter-inline">
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
                  <div className="newsletter-inline-warning">
                    ¡Advertencia! Estás seleccionando más de 100 destinatarios. El envío puede demorar o fallar según el proveedor.
                  </div>
                )}
                <div className="newsletter-chip-row">
                  {selectedEmails.map(e => (
                    <span key={e.value} className="newsletter-chip">
                      {e.label}
                    </span>
                  ))}
                  <button
                    type="button"
                    className="newsletter-chip-btn"
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
                    className="newsletter-chip-btn is-danger"
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
                    className="newsletter-mini-input newsletter-fav-input"
                  />
                  <button
                    type="button"
                    className="newsletter-chip-btn is-success"
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
              <div className="newsletter-favorites-row">
                <span className="newsletter-favorites-label">Favoritos:</span>
                {favorites.map((fav, i) => (
                  <button
                    key={fav.name + i}
                    type="button"
                    className="newsletter-fav-btn"
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
                  className="newsletter-fav-btn is-danger"
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
        <div className="newsletter-templates-row">
          <select
            value={selectedTemplate}
            onChange={handleTemplateChange}
            className="newsletter-template-select"
          >
            <option value="">Seleccionar plantilla rápida...</option>
            {templates.map((tpl, idx) => (
              <option key={tpl.name + idx} value={idx}>{tpl.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSaveTemplate}
            className="newsletter-chip-btn is-primary"
          >
            Guardar como plantilla
          </button>
          <button
            type="button"
            onClick={handleDeleteTemplate}
            disabled={selectedTemplate === ""}
            className="newsletter-chip-btn is-danger"
          >
            Eliminar plantilla
          </button>
          <button
            type="button"
            onClick={handleSaveDraft}
            className="newsletter-chip-btn is-success"
          >
            Guardar borrador
          </button>
          <button
            type="button"
            onClick={handleClearDraft}
            className="newsletter-chip-btn is-warning"
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
        <div className="newsletter-length-counter">
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
        <div className="newsletter-length-counter">
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
        <div className="newsletter-schedule-block">
          <label className="newsletter-inline-label">
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
            className="newsletter-mini-input"
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0,16)}
          />
        </div>
        <button type="submit" className="newsletter-form-btn" disabled={loading}>
          {loading ? (scheduledAt ? "Programando..." : "Enviando...") : (scheduledAt ? "Programar envío" : "Enviar newsletter")}
        </button>
        {msg && <div className={`newsletter-form-msg ${isErrorMsg ? "is-error" : "is-success"}`}>{msg}</div>}
      </form>
      {/* Vista previa en vivo tipo email real */}
      <div className="newsletter-preview">
        <div className="newsletter-preview-title">Vista previa tipo email</div>
        <div className="newsletter-preview-card">
          <div className="newsletter-preview-subject">
            {subject || <span className="newsletter-preview-muted">[Asunto]</span>}
          </div>
          <div
            className="newsletter-preview-body"
            dangerouslySetInnerHTML={{
              __html: text
                ? text
                    .replace(/\n/g, '<br/>')
                    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                    .replace(/\*(.*?)\*/g, '<i>$1</i>')
                : '<span class="newsletter-preview-muted">[Mensaje]</span>'
            }}
          />
        </div>
      </div>
    </div>
  );
}