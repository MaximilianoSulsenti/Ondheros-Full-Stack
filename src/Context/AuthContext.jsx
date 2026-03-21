
import { createContext, useContext, useState, useEffect } from "react";
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  // LOGIN REAL
  const login = async (email, password) => {
    try {
      const res = await fetch("http://localhost:8080/api/sessions/login", {
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
      const res = await fetch("http://localhost:8080/api/users/register", {
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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    // Opcional: llamar a /api/sessions/logout si quieres cerrar sesión en backend
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);