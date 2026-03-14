import "./NavBar.css";
import CartWidget from "../CartWidget/CartWidget";
import { Navbar, Nav, Container } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext";
import 'bootstrap/dist/css/bootstrap.min.css';


const NavBar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar expand="lg" variant="dark" className="navbar">
      <Container className="nav-container">
        <div>
          <Navbar.Brand as={Link} to="/">
            <img className="logo" src="/Ondheros-img/ondheroslogo.jpg" alt="Logo de la tienda" />
          </Navbar.Brand>
        </div>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <div>
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto nav-link">
              <Nav.Link as={Link} to="/categoria/remeras">Remeras</Nav.Link>
              <Nav.Link as={Link} to="/categoria/billeteras">Billeteras</Nav.Link>
              <Nav.Link as={Link} to="/categoria/medias">Medias</Nav.Link>
              <div className="cart-mobile">
                <CartWidget />
              </div>

              {/* 🔐 Auth zone */}
              {!isAuthenticated ? (
                <Nav.Link as={Link} to="/auth" className="login-registro">
                  Login / Registro
                </Nav.Link>
                ) : (

                <div className="auth-zone">
                  {/*perfil*/}
                  <Nav.Link as={Link} to="/profile" className="user-link">{user?.first_name || "Mi Cuenta"}</Nav.Link>

                  {/* Admin (solo si es admin) */}
                  {user?.role === "admin" && (
                    <Nav.Link as={Link} to="/admin" className="admin-link">
                      Panel Admin
                    </Nav.Link>
                  )}
                 
                    {/* Logout */}
                  <button onClick={handleLogout} className="logout-btn">
                    Cerrar sesión
                  </button>
                </div>
              )}

            </Nav>
          </Navbar.Collapse>
        </div>
        <div className="cart-desktop">
          <CartWidget />
        </div>

      </Container>
    </Navbar>
  );
};

export default NavBar;
