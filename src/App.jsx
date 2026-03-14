import { BrowserRouter, Route, Routes } from "react-router-dom"
import "./App.css"
import ItemDetailContainer from "./componentes/ItemDetailContainer/ItemDetailContainer"
import ItemListContainer from "./componentes/ItemListContainer/ItemListContainer"
import NavBar from "./componentes/NavBar/NavBar"
import { CarritoProvider } from "./Context/CarritoContext"
import Cart from "./componentes/Cart/Cart"
import Checkout from "./componentes/Checkout/Checkout"
import Footer from "./componentes/Footer/Footer"
import "bootstrap/dist/css/bootstrap.min.css"
import { ToastContainer } from "react-toastify"
import AuthPages from "./pages/AuthPages.jsx"
import { AuthProvider } from "./Context/AuthContext"
import Profile from "./pages/Profile.jsx"
import PrivateRoute from "./routes/privateRoute"
import AdminRoute from "./routes/AdminRoute.jsx"
import AdminPanel from "./pages/admin/AdminPanel.jsx"


const App = () => { 


  return (
<>
   <BrowserRouter>
    <AuthProvider>
   <CarritoProvider>
    <NavBar/>
     <Routes>
      <Route path="/" element={<ItemListContainer/>}/>
      <Route path="/profile" element={<PrivateRoute><Profile/></PrivateRoute>}/>
      <Route path="/admin" element={<AdminRoute><AdminPanel/></AdminRoute>}/>
      <Route path="/categoria/:categoriaId" element={<ItemListContainer/>}/>
      <Route path="/item/:itemId" element={<ItemDetailContainer/>}/>
      <Route path="/cart" element={<PrivateRoute><Cart/></PrivateRoute>}/>
      <Route path= "/checkout" element={<PrivateRoute><Checkout/></PrivateRoute>}/>
      <Route path="/auth" element={<AuthPages/>}/>
     </Routes>
     <Footer/>
    </CarritoProvider>
    <ToastContainer/>
    </AuthProvider>
   </BrowserRouter>

</>
  )
}

export default App