import "./NavBar.css";
import CartWidget from "../CartWidget/CartWidget";
import { Navbar, Nav, Container, NavDropdown } from "react-bootstrap";
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
        <Navbar.Brand as={Link} to="/">
          <img className="logo" src="/Ondheros-img/ondheroslogo.jpg" alt="Logo de la tienda" />
        </Navbar.Brand>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <div className="navbar-content">
            <Nav className="nav-categorias">
              <Nav.Link as={Link} to="/categoria/remeras">Remeras</Nav.Link>
              <Nav.Link as={Link} to="/categoria/billeteras">Billeteras</Nav.Link>
              <Nav.Link as={Link} to="/categoria/medias">Medias</Nav.Link>
            </Nav>
            <div className="nav-user-cart">
              <div className="cart-navbar">
                <CartWidget />
              </div>
              {!isAuthenticated ? (
                <Nav.Link as={Link} to="/auth" className="login-registro">
                  Login / Registro
                </Nav.Link>
              ) : (
                <NavDropdown
                  title={user?.first_name || "Mi Cuenta"}
                  id="user-dropdown"
                  align="end"
                  className="user-dropdown"
                >
                  <NavDropdown.Item as={Link} to="/profile">Perfil</NavDropdown.Item>
                  {user?.role === "admin" && (
                    <NavDropdown.Item as={Link} to="/admin">Panel Admin</NavDropdown.Item>
                  )}
                  <NavDropdown.Divider />
                  <NavDropdown.Item as="button" onClick={handleLogout} className="logout-btn">
                    Cerrar sesión
                  </NavDropdown.Item>
                </NavDropdown>
              )}
            </div>
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBar;
