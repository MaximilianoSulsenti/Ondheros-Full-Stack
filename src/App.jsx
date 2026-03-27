import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import ItemDetailContainer from "./componentes/ItemDetailContainer/ItemDetailContainer";
import ItemListContainer from "./componentes/ItemListContainer/ItemListContainer";
import NavBar from "./componentes/NavBar/NavBar";
import { CarritoProvider } from "./Context/CarritoContext";
import Cart from "./componentes/Cart/Cart";
import Checkout from "./componentes/Checkout/Checkout";
import Footer from "./componentes/Footer/Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer } from "react-toastify";
import AuthPages from "./pages/AuthPages.jsx";
import { AuthProvider } from "./Context/AuthContext";
import Profile from "./pages/Profile.jsx";
import PrivateRoute from "./routes/privateRoute.jsx";
import AdminRoute from "./routes/AdminRoute.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Orders from "./pages/admin/Orders.jsx";
import Products from "./pages/admin/Products.jsx";
import Users from "./pages/admin/Users.jsx";
import AuthGoogleSuccess from "./pages/AuthGoogleSuccess.jsx";

const App = () => {
  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <CarritoProvider>
            <Routes>
              {/* Rutas de tienda: NavBar y Footer */}
              <Route path="/" element={<> <NavBar /><ItemListContainer /><Footer /></>}/>
              <Route path="/categoria/:categoriaId" element={<><NavBar /><ItemListContainer /><Footer /></>}/>
              <Route path="/item/:itemId" element={<><NavBar /><ItemDetailContainer /><Footer /></>}/>
              <Route path="/cart" element={<><NavBar /><PrivateRoute><Cart /></PrivateRoute><Footer /></>}/>   
              <Route path="/checkout" element={<><NavBar /><PrivateRoute><Checkout /></PrivateRoute><Footer /></>}/>
              <Route path="/profile" element={<><NavBar /><PrivateRoute><Profile /></PrivateRoute><Footer /></>}/>
              <Route path="/auth" element={<><NavBar /><AuthPages /><Footer /></>}/>
              <Route path="/auth/google/success" element={<><NavBar /><AuthGoogleSuccess /><Footer /></>}/>

              {/* Rutas de admin: sin NavBar ni Footer */}
              <Route path="/admin/*" element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="orders" element={<Orders />} />
                <Route path="products" element={<Products />} />
                <Route path="users" element={<Users />} />
              </Route>
            </Routes>
            <ToastContainer />
          </CarritoProvider>
        </AuthProvider>
      </BrowserRouter>
    </>
  );
};

export default App;