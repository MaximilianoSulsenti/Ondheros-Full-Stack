import { Router } from "express";
import ViewsController from "../controllers/views.controller.js";
import ViewsService from "../services/views.service.js";

export default function createViewsRouter(productService, cartService) {
    const router = Router();
    
    const viewsService = new ViewsService(productService, cartService);
    const viewsController = new ViewsController(viewsService);

    // Vista principal con lista de productos
    router.get("/", viewsController.home);

    // Vista para productos en tiempo real
    router.get("/realtimeproducts", viewsController.realtime);

    // Vista para productos paginados
    router.get("/products", viewsController.products);

    // Vista para mostrar un carrito específico// 
    router.get("/carts/:cid", viewsController.cartById);

    // Renderizar vista del carrito
    router.get("/:cartId/view", viewsController.cartView);


      return router;
  }
