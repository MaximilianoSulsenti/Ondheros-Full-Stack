import React, { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import "./AuthPages.css";

export default function AuthPages() {
  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    age: "",
    password: ""
  });

  // Forgot password modal
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = location.state?.from || "/";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Limpiar error al escribir
    setSuccess("");
  };

  const validate = () => {
    if (!form.email.includes("@")) return "Email inválido";
    if (form.password.length < 6) return "La contraseña debe tener al menos 6 caracteres";
    if (mode === "register") {
      if (!form.first_name || !form.last_name) return "Nombre y apellido obligatorios";
      if (!form.age || Number(form.age) < 1) return "Edad inválida";
    }
    return null;
  };

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setLoading(true);
    try {
      if (mode === "login") {
        const result = await login(form.email, form.password);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSuccess("Login exitoso");
        setTimeout(() => {
          navigate(redirectTo, { replace: true });
        }, 800);
      }
      if (mode === "register") {
        const result = await register(form);
        if (!result.ok) {
          setError(result.error);
          return;
        }
        setSuccess("Usuario registrado correctamente");
        setTimeout(() => {
          setMode("login");
          setSuccess("");
        }, 1200);
      }
    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password handler
  const handleForgot = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    setForgotLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/password/forgot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok) {
        setForgotMsg("Si el email existe, recibirás instrucciones para recuperar tu contraseña.");
      } else {
        setForgotMsg(data.error || "No se pudo enviar el email de recuperación");
      }
    } catch {
      setForgotMsg("Error de conexión");
    } finally {
      setForgotLoading(false);
      setTimeout(() => {
        setForgotMsg("");
        setShowForgot(false);
        setForgotEmail("");
      }, 3500);
    }
  };

  return (
    <div className="contenedor-auth">
      <div className={`form-auth ${mode === "register" ? "register" : "login"}`}>
        <h1 className="titulo-auth">
          {mode === "login" ? "Iniciar sesión" : "Registrarse"}
        </h1>

        {error && <div className="auth-error" role="alert">{error}</div>}
        {success && <div className="auth-success" role="status">{success}</div>}

        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={`form-anim ${mode === "register" ? "show" : "hide"}`}>
            {mode === "register" && (
              <>
                <input type="text" name="first_name" placeholder="Nombre" onChange={handleChange} className="input-auth" />
                <input type="text" name="last_name" placeholder="Apellido" onChange={handleChange} className="input-auth" />
                <input type="number" name="age" placeholder="Edad" onChange={handleChange} className="input-auth" />
              </>
            )}
          </div>
          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="input-auth" autoComplete="username" />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="input-auth" autoComplete={mode === "login" ? "current-password" : "new-password"} />
          {mode === "login" && (
            <div style={{ textAlign: "right", marginTop: "-8px", marginBottom: "8px" }}>
              <button type="button" className="link-forgot" style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 600, cursor: "pointer", fontSize: "0.98rem", padding: 0 }} onClick={() => setShowForgot(true)}>
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
          <button type="submit" className="boton-auth" disabled={loading}>
            {loading ? <span className="loader"></span> : (mode === "login" ? "Ingresar" : "Crear cuenta")}
          </button>
          {mode === "login" && (
            <button
              type="button"
              className="boton-auth google"
              onClick={() => {
                window.location.href = "http://localhost:8080/api/auth/google";
              }}
              style={{
                background: "#fff",
                color: "#444",
                border: "3px solid #ccc",
                marginTop: "10px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                justifyContent: "center",
                fontWeight: 500,
                fontSize: "1rem",
                padding: "8px 16px",
                borderRadius: "10px",
                boxShadow: "0 1px 2px rgba(60,60,60,0.07)"
              }}
            >
              <svg width="28" height="28" viewBox="0 0 48 48">
                <g>
                  <path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 30.1 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 19.7-8 19.7-20 0-1.3-.1-2.7-.2-4z"/>
                  <path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 16.1 19.4 13 24 13c3.1 0 5.9 1.1 8.1 2.9l6.1-6.1C34.5 6.5 29.5 4 24 4c-7.2 0-13.3 4.1-16.7 10.7z"/>
                  <path fill="#FBBC05" d="M24 44c5.4 0 10.4-1.8 14.3-4.9l-6.6-5.4C29.7 35.5 27 36.5 24 36.5c-6.1 0-10.7-3.9-12.5-9.1l-7 5.4C7.7 39.9 15.2 44 24 44z"/>
                  <path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.1 5.5-7.7 5.5-2.2 0-4.2-.7-5.7-2l-7 5.4C15.2 39.9 19.4 44 24 44c7.2 0 13.3-4.1 16.7-10.7z"/>
                </g>
              </svg>
              Ingresar con Google
            </button>
          )}
        </form>

        <div className="toggle-auth">
          {mode === "login" ? (
            <p>
              ¿No tenés cuenta?
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
              >Registrate</button>
            </p>
          ) : (
            <p>
              ¿Ya tenés cuenta?
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >Iniciar sesión</button>
            </p>
          )}
        </div>
      </div>

      {/* Modal Olvidaste tu contraseña */}
      {showForgot && (
        <div className="profile-modal-overlay profile-modal-fadein">
          <div className="profile-modal">
            <form className="profile-edit-form" onSubmit={handleForgot}>
              <label>Ingresa tu email para recuperar tu contraseña:
                <input type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} required />
              </label>
              <div className="profile-edit-actions">
                <button type="submit" className="profile-save-btn" disabled={forgotLoading}>{forgotLoading ? "Enviando..." : "Enviar"}</button>
                <button type="button" className="profile-cancel-btn" onClick={() => setShowForgot(false)} disabled={forgotLoading}>Cancelar</button>
              </div>
              {forgotMsg && <div className="profile-save-msg">{forgotMsg}</div>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
