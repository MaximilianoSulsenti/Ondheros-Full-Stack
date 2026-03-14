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

  // 🔐 LOGIN MOCK
  const login = async (email, password) => {
    // ⚠️ MOCK FRONT (después se conecta al backend)
    const mockUser = {
      id: 1,
      first_name: "Maxi",
      email,
      role: email.includes("admin") ? "admin" : "user" // mock role
    };

    localStorage.setItem("token", "fake-jwt-token");
    localStorage.setItem("user", JSON.stringify(mockUser));

    setUser(mockUser);
    setIsAuthenticated(true);

    return { ok: true };
  };

  // 🧾 REGISTER MOCK
  const register = async (data) => {
    return { ok: true };
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      login,
      register,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);