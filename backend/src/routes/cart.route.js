import { Router } from "express";
import CartsController from "../controllers/carts.controller.js";
import { authorize } from "../middlewares/auth.js";
import passport from "passport";

export default function createCartRouter(cartService, productService, ticketService) {
    const router = Router();

    // Controller
    const Controller = new CartsController(cartService, ticketService);

    // Historial de compras del usuario autenticado
    router.get(
      "/my-tickets",
      passport.authenticate("current", { session: false }),
      authorize("user", "admin"),
      Controller.getMyTickets
    );

    // Contar tickets (solo admin)
    router.get("/tickets/count", passport.authenticate("current", { session: false }), authorize("admin"), Controller.countTickets);

    // Listar todos los tickets (solo admin)
    router.get(
      "/tickets",
      passport.authenticate("current", { session: false }),
      authorize("admin"),
      Controller.getAllTickets
    );

    // Archivar/desarchivar ticket (solo admin)
    router.patch(
      "/tickets/:ticketId/archive",
      passport.authenticate("current", { session: false }),
      authorize("admin"),
      Controller.setTicketArchived
    );

    // Crear carrito (user y admin)
    router.post("/", passport.authenticate("current", { session: false }), authorize("user", "admin"), Controller.createCart);

    // Obtener carrito por ID (user y admin)
    router.get("/:cartId", passport.authenticate("current", { session: false }), authorize("user", "admin"), Controller.getCartById);

    // Agregar producto al carrito (user y admin)
    router.post("/:cartId/product/:productId", passport.authenticate("current", { session: false }), authorize("user", "admin"), Controller.addProductToCart);

    // Actualizar todos los productos del carrito (user y admin)
    router.put("/:cartId", passport.authenticate("current", { session: false }), authorize("user", "admin"), Controller.updateCartProducts);

    // Actualizar cantidad de un producto en el carrito (solo admin)
    router.put("/:cartId/product/:productId", passport.authenticate("current", { session: false }), authorize("admin"),  Controller.updateProductQuantity);

    // Eliminar producto del carrito (user y admin)
    router.delete("/:cartId/product/:productId", passport.authenticate("current", { session: false }), authorize("user", "admin"), Controller.deleteProductFromCart);

    // Eliminar todos los productos del carrito (solo admin)
    router.delete("/:cartId", passport.authenticate("current", { session: false }), authorize("admin"), Controller.clearCart);

    // Finalizar compra y generar ticket (solo user)
    router.post("/:cartId/purchase", passport.authenticate("current", { session: false }), authorize("user"), Controller.purchaseCart);

    return router;
}

