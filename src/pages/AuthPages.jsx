import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useLocation , useNavigate } from "react-router-dom"; 
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

  const location = useLocation();
  const navigate = useNavigate();

  const redirectTo = location.state?.from || "/";

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
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

  const handleSubmit = async (e) => {
    
    const { login, register } = useAuth();

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
        if (result.ok) {
          setError (result.error);
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
        setMode("login"); // volver a login después de registrarse
      }

    } catch (err) {
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contenedor-auth">
      <div className={`form-auth ${mode === "register" ? "register" : "login"}`}>
        <h1 className="titulo-auth">
          {mode === "login" ? "Iniciar sesión" : "Registrarse"}
        </h1>

        {error && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>

          <div className={`form-anim ${mode === "register" ? "show" : "hide"}`}>
            {mode === "register" && (
              <>
                <input type="text" name="first_name" placeholder="Nombre" onChange={handleChange} className="input-auth" />
                <input type="text" name="last_name" placeholder="Apellido" onChange={handleChange} className="input-auth" />
                <input type="number" name="age" placeholder="Edad" onChange={handleChange} className="input-auth" />
              </>
            )}
          </div>

          <input type="email" name="email" placeholder="Email" onChange={handleChange} className="input-auth" />
          <input type="password" name="password" placeholder="Contraseña" onChange={handleChange} className="input-auth" />

          <button type="submit" className="boton-auth" disabled={loading}>
            {loading ? <span className="loader"></span> : (mode === "login" ? "Ingresar" : "Crear cuenta")}
          </button>
        </form>

        <div className="toggle-auth">
          {mode === "login" ? (
            <p>
              ¿No tenés cuenta?
              <button onClick={() => setMode("register")}>Registrate</button>
            </p>
          ) : (
            <p>
              ¿Ya tenés cuenta?
              <button onClick={() => setMode("login")}>Iniciar sesión</button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}