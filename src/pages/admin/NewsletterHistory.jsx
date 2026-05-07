import React, { useEffect, useState, useRef } from "react";
import "./NewsletterHistory.css";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const PAGE_SIZE = 10;

const NewsletterHistory = () => {
  const searchInputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timeout);
  }, [search]);

  useEffect(() => {
    let mounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const params = new URLSearchParams({
          page,
          pageSize: PAGE_SIZE,
          search: debouncedSearch
        });
        const res = await fetch(`${backendUrl}/api/admin/newsletter/history?${params}` , {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Error al obtener historial");
        const data = await res.json();
        if (mounted) {
          setHistory(data.history || []);
          setTotalPages(data.totalPages || 1);
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchHistory();
    return () => { mounted = false; };
  }, [page, debouncedSearch]);


  // Mensaje temporal de éxito
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 2500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  if (loading) return <div>Cargando historial...</div>;
  if (error) return <div style={{color:'red'}}>Error: {error}</div>;

  return (
    <div>
      <h1>Historial de envíos de Newsletter</h1>
      <div className="newsletter-history-search-wrapper">
        {successMsg && (
          <div style={{background:'#d1fae5', color:'#065f46', padding:'8px 16px', borderRadius:6, marginBottom:10, fontWeight:500, border:'1px solid #10b981'}}>
            {successMsg}
          </div>
        )}
        <input
          type="text"
          placeholder="Buscar por asunto o email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="newsletter-history-search"
          autoFocus
        />
      </div>
      {history.length === 0 ? (
        <div>No hay envíos registrados.</div>
      ) : (
        <div className="admin-table-wrapper" style={{overflowX:'auto'}}>
          <table className="admin-table" style={{minWidth:900, tableLayout:'auto'}}>
            <thead>
              <tr>
                <th style={{whiteSpace:'nowrap'}}>Estado</th>
                <th style={{whiteSpace:'nowrap'}}>Fecha programada</th>
                <th style={{whiteSpace:'nowrap'}}>Fecha de envío</th>
                <th style={{whiteSpace:'nowrap'}}>Asunto</th>
                <th style={{whiteSpace:'nowrap'}}>Enviado por</th>
                <th style={{whiteSpace:'nowrap', minWidth:120}}>Emails destinatarios</th>
                <th style={{whiteSpace:'nowrap'}}>Adjuntos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item._id || idx} className={item.status === "pendiente" ? "newsletter-history-pending" : "newsletter-history-sent"}>
                  <td>
                    {item.status === "pendiente" ? (
                      <span style={{color:'#f59e42', fontWeight:600}}>Pendiente</span>
                    ) : (
                      <span style={{color:'#10b981', fontWeight:600}}>Enviado</span>
                    )}
                  </td>
                  <td>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : '-'}</td>
                  <td>{item.sentAt ? new Date(item.sentAt).toLocaleString() : '-'}</td>
                  <td>{item.subject}</td>
                  <td>{item.sentBy}</td>
                  <td>
                    {Array.isArray(item.sentTo) && item.sentTo.length > 0 ? (
                      <div className="newsletter-history-emails">
                        {item.sentTo.map((email, i) => (
                          <span key={email + i} className="newsletter-history-email-chip">{email}</span>
                        ))}
                      </div>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    {item.attachments && item.attachments.length > 0 ? (
                      <ul className="newsletter-history-attachments">
                        {item.attachments.map((a, i) => (
                          <li key={a.filename + i} className="newsletter-history-attachment-item">{a.filename}</li>
                        ))}
                      </ul>
                    ) : (
                      <span>-</span>
                    )}
                  </td>
                  <td>
                    <button
                      title="Eliminar newsletter"
                      className="newsletter-history-delete-btn"
                      style={{color:'#e11d48', background:'none', border:'none', fontSize:'1.2em', cursor:'pointer'}}
                      onClick={async () => {
                        if(window.confirm('¿Seguro que deseas eliminar este newsletter?')) {
                          try {
                            const token = localStorage.getItem("token");
                            const res = await fetch(`${backendUrl}/api/admin/newsletter/${item._id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${token}` }
                            });
                            if (!res.ok) throw new Error("No se pudo eliminar");
                            setHistory(h => h.filter(n => n._id !== item._id));
                            setSuccessMsg("Newsletter eliminado correctamente");
                          } catch (err) {
                            setSuccessMsg("");
                            setError("Error al eliminar: " + err.message);
                          }
                        }
                      }}
                    >✕</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <div className="newsletter-history-pagination">
        <button
          onClick={()=>setPage(p=>Math.max(1,p-1))}
          disabled={page===1}
          className="newsletter-history-btn"
        >Anterior</button>
        <span className="newsletter-history-page-label">Página {page} de {totalPages}</span>
        <button
          onClick={()=>setPage(p=>Math.min(totalPages,p+1))}
          disabled={page===totalPages}
          className="newsletter-history-btn"
        >Siguiente</button>
      </div>
    </div>
  );
}

export default NewsletterHistory;


