import { Router } from "express";
import CartsController from "../controllers/carts.controller.js";
import { authorize } from "../middlewares/auth.js";
import passport from "passport";

export default function createCartRouter(cartService, productService, ticketService) {
    const router = Router();

    // Controller
    const Controller = new CartsController(cartService, ticketService);


    // Contar tickets (debe ir antes de /:cartId)
    router.get("/tickets/count", passport.authenticate("current", { session: false }), authorize("admin"), Controller.countTickets);

    // Listar todos los tickets (debe ir antes de /:cartId)
    router.get(
      "/tickets",
      passport.authenticate("current", { session: false }),
      authorize("admin"),
      Controller.getAllTickets
    );

    // Crear carrito
    router.post("/", passport.authenticate("current", { session: false }), authorize("user"), Controller.createCart);

    // Obtener carrito por ID
    router.get("/:cartId", passport.authenticate("current", { session: false }), authorize("user", "admin"), Controller.getCartById);

    // Agregar producto al carrito
    router.post("/:cartId/product/:productId", passport.authenticate("current", { session: false }), authorize("user"), Controller.addProductToCart);

    //actualiza todos los productos del carrito
    router.put("/:cartId", passport.authenticate("current", { session: false }), authorize("user"), Controller.updateCartProducts);

    //actualizar cantidad de un producto en el carrito
    router.put("/:cartId/product/:productId", passport.authenticate("current", { session: false }), authorize("admin"),  Controller.updateProductQuantity);

    // elimina del carrito el producto seleccionado 
    router.delete("/:cartId/product/:productId", passport.authenticate("current", { session: false }), authorize("user"), Controller.deleteProductFromCart);

    //elimina todos los productos del carrito 
    router.delete("/:cartId", passport.authenticate("current", { session: false }), authorize("admin"), Controller.clearCart);

    // ruta para finalizar compra y generar ticket 
    router.post("/:cartId/purchase", passport.authenticate("current", { session: false }), authorize("user"), Controller.purchaseCart);

    return router;
}

