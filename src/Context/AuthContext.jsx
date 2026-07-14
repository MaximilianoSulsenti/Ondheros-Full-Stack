import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const clearUserCartKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    const uid = user?._id || user?.id;
    if (uid) localStorage.removeItem(`cartId_${uid}`);
  } catch {}
  // limpiar también la clave genérica por si quedó de versiones anteriores
  localStorage.removeItem("cartId");
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsAuthenticated(true);
      fetch(`${backendUrl}/api/sessions/current`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data && data.payload) {
            setUser(data.payload);
            localStorage.setItem("user", JSON.stringify(data.payload));
          } else {
            setUser(null);
            setIsAuthenticated(false);
            localStorage.removeItem("token");
            localStorage.removeItem("user");
          }
        })
        .catch(() => {
          setUser(null);
          setIsAuthenticated(false);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        });
    } else {
      setIsAuthenticated(false);
      setUser(null);
    }
  }, []);

  // LOGIN REAL
  const login = async (email, password) => {
    try {
      const res = await fetch(`${backendUrl}/api/sessions/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        return { ok: false, error: "Respuesta inválida del servidor" };
      }
      if (!res.ok) {
        return { ok: false, error: data?.message || data?.error || "Credenciales inválidas" };
      }
      if (data.token) localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      setIsAuthenticated(true);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "No se pudo conectar con el servidor" };
    }
  };

  // REGISTER REAL
  const register = async (form) => {
    try {
      const res = await fetch(`${backendUrl}/api/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      let data;
      try {
        data = await res.json();
      } catch (e) {
        return { ok: false, error: "Respuesta inválida del servidor" };
      }
      if (!res.ok) {
        return { ok: false, error: data?.message || data?.error || "Error al registrar" };
      }
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "No se pudo conectar con el servidor" };
    }
  };

  const logout = () => {
    clearUserCartKey();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("googleName");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);