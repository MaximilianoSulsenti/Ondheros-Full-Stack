import { Router } from "express";
import PasswordResetController from "../controllers/passwordReset.controller.js";
import PasswordResetService from "../services/passwordReset.service.js";
import PasswordResetDAO from "../dao/mongo/passwordReset.dao.js";
import PasswordResetRepository from "../repositories/passwordReset.repository.js";
import UsersRepository from "../repositories/users.repository.js";
import UsersDAO from "../dao/mongo/users.dao.js";
import MailService from "../services/mail.service.js";

const router = Router();

// inyección de dependencias
const resetDAO = new PasswordResetDAO();
const resetRepo = new PasswordResetRepository(resetDAO);

const usersDAO = new UsersDAO();
const usersRepo = new UsersRepository(usersDAO);

const mailService = new MailService();

const service = new PasswordResetService(resetRepo, usersRepo, mailService);
const controller = new PasswordResetController(service);


router.post("/forgot", controller.requestReset);
router.post("/reset", controller.resetPassword);

router.get("/reset-password", (req, res) => {
        const { token } = req.query;

        if (!token) {
          return res.status(400).send("Token inválido");
        }

        res.send(`
          <html>
            <body style="font-family: sans-serif;">
              <h2>Restablecer contraseña</h2>
              <form method="POST" action="/api/password/reset">
                <input type="hidden" name="token" value="${token}" />
                <input type="password" name="newPassword" placeholder="Nueva contraseña" required />
                <br/><br/>
                <button type="submit">Cambiar contraseña</button>
              </form>
            </body>
          </html>
        `);
        });

export default router;
