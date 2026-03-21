import { Router } from "express";
import passport from "passport";
import ProductsController from "../controllers/products.controller.js";
import ProductService from "../services/product.service.js";
import ProductsDAO from "../dao/mongo/products.dao.js";
import ProductsRepository from "../repositories/products.repository.js";
import { authorize } from "../middlewares/auth.js";

export default function createProductRouter() {
    const router = Router();
    
    const productsDAO = new ProductsDAO();
    const productsRepository = new ProductsRepository(productsDAO);
    const productService = new ProductService(productsRepository);
    const controller = new ProductsController(productService, null);

  // GET productos con paginación, filtros y orden
    router.get("/", passport.authenticate("current", { session: false }), authorize("admin"), controller.getProducts);
    router.get("/count", 
      passport.authenticate("current", { session: false }), 
      authorize("admin"),
      controller.countProducts
    );
    router.get("/:productId", controller.getProductById);
    router.post("/", passport.authenticate("current", { session: false }), authorize("user", "admin"), controller.createProduct);
    router.put("/:productId", passport.authenticate("current", { session: false }), authorize("admin"), controller.updateProduct);
    router.delete("/:productId", passport.authenticate("current", { session: false }), authorize("admin"), controller.deleteProduct);
    return router;
}
