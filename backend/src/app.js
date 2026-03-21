import express from "express";
import { Server } from "socket.io";
import cors from "cors";
import mongoSingleton from "./config/database/mongoConnection.js";
import exphbs from "express-handlebars";
import path from "path";
import { fileURLToPath } from "url";
import passport from "passport";
import { initializePassport } from "./config/passport.js";
import { env } from "./config/environment.js";
import initProductSocket from "./sockets/product.socket.js";

// DAO
import ProductsDAO from "./dao/mongo/products.dao.js";
import CartsDAO from "./dao/mongo/carts.dao.js";
import UsersDAO from "./dao/mongo/users.dao.js";
import TicketDAO from "./dao/mongo/ticket.dao.js";

//Repositories
import ProductsRepository from "./repositories/products.repository.js";
import CartsRepository from "./repositories/carts.repository.js";
import UsersRepository from "./repositories/users.repository.js";
import TicketRepository from "./repositories/ticket.repository.js";

//Services
import ProductService from "./services/product.service.js";
import CartService from "./services/cart.service.js";
import UserService from "./services/user.service.js";
import TicketService from "./services/ticket.service.js";

// Routers
import createProductRouter from "./routes/product.route.js";
import createCartRouter from "./routes/cart.route.js";
import createViewsRouter from "./routes/view.route.js";
import createUserRouter from "./routes/user.route.js";
import sessionRouter from "./routes/sessions.route.js";
import passwordResetRouter from "./routes/passwordReset.route.js";

// Definiciones de __dirname y __filename en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

const allowedOrigins = [
  "http://localhost:5173", // Vite (desarrollo)
  // Agrega aquí tu dominio de producción cuando lo tengas, por ejemplo:
  // "https://ondheros.netlify.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true // Si usas cookies o autenticación con credenciales
}));

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

initializePassport();
app.use(passport.initialize());

// Archivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Handlebars helpers 
const hbs = exphbs.create({
    helpers: {
        multiply: (a, b) => a * b,
        calculateTotal: (items) =>{
         return items.reduce((sum, item) => sum + (item.product.precio * item.quantity), 0);
        }
    }
});

// Configuración Handlebars
app.engine("handlebars", hbs.engine);
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Instanciación de DAOs, Repositories y Services para productos, carritos y usuarios
const productsDAO = new ProductsDAO();
const productsRepository = new ProductsRepository(productsDAO);
const productService = new ProductService(productsRepository);

const cartsDAO = new CartsDAO();
const cartsRepository = new CartsRepository(cartsDAO);
const cartService = new CartService(cartsRepository, productsRepository);

const usersDAO = new UsersDAO();
const usersRepository = new UsersRepository(usersDAO);
const userService = new UserService(usersRepository);

const ticketDAO = new TicketDAO();
const ticketRepository = new TicketRepository(ticketDAO);
const ticketService = new TicketService(ticketRepository);

// conexion del servidor
const PORT = env.PORT;
const httpServer = app.listen(PORT, () =>{
  console.log(`Servidor escuchando en puerto ${PORT}`)
  mongoSingleton.getInstance();
});

const io = new Server(httpServer);

// rutas con los managers correspondientes
app.use("/api/products", createProductRouter(productService, io));
app.use("/api/carts", createCartRouter(cartService, productService, ticketService));
app.use("/api/users", createUserRouter(userService));
app.use("/", createViewsRouter(productService, cartService));
app.use("/api/sessions", sessionRouter);
app.use("/api/password", passwordResetRouter);

 initProductSocket(io, productService);
