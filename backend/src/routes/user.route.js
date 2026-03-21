import { Router } from "express";
import passport from "passport";
import { authorize } from "../middlewares/auth.js";
import UsersController from "../controllers/users.controller.js";
import UsersDAO from "../dao/mongo/users.dao.js";
import UserService from "../services/user.service.js";
import UsersRepository from "../repositories/users.repository.js";
import { checkUserOwnership } from "../middlewares/ownership.js";

export default function createUserRouter() {
    const router = Router();

    const usersDAO = new UsersDAO();
    const usersRepository = new UsersRepository(usersDAO);
    const usersService = new UserService(usersRepository);
    const controller = new UsersController(usersService);

    // GET para obtener todos los usuarios (protegido, solo admin)
    router.get("/", passport.authenticate("current", { session: false }), 
       authorize("admin"),
        controller.getUsers
    );

    router.get("/:uid", passport.authenticate("current", { session: false }), controller.getUserById);

    // PUT para actualizar un usuario
    router.put("/:uid", passport.authenticate("current", { session: false }),checkUserOwnership,authorize("user","admin"), controller.updateUser);

    // DELETE para eliminar un usuario
    router.delete("/:uid", passport.authenticate("current", { session: false }), authorize("admin"), controller.deleteUser);

    // POST para crear un nuevo usuario con Passport 
    router.post("/register", (req, res, next) => {
       passport.authenticate("register", { session: false }, (err, user, info) => {
         if (err)
           return res.status(500).json({ status: "error", error: err.message });
     
         if (!user)
           return res.status(400).json({ status: "error", error: info.message || "Error en el registro" });
     
         res.status(201).json({status: "success",message: "Usuario registrado correctamente", });
       })(req, res, next);
     });

     router.get("/count", 
       passport.authenticate("current", { session: false }), 
       authorize("admin"),
       controller.countUsers
     );

    return router;
}
