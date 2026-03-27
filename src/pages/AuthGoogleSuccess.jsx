import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const AuthGoogleSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("token");
    const name = params.get("name");

    if (token) {
      localStorage.setItem("token", token);
      if (name) {
        localStorage.setItem("googleName", name);
      }
      navigate("/profile");
    } else {
      navigate("/auth");
    }
  }, [location, navigate]);

  return <div>Autenticando con Google...</div>;
};

export default AuthGoogleSuccess;