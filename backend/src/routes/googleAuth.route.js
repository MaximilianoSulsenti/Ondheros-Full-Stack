import { Router } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt.js";
import CurrentUserDTO from "../dto/currentUser.dto.js";

const router = Router();

// Iniciar login con Google
router.get(
  "/",
  passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

// Callback de Google
router.get(
  "/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  (req, res) => {
    const user = req.user;
    const token = generateToken(user);
    const userDTO = new CurrentUserDTO(user);

    // Puedes devolver JSON (API) o redirigir al frontend con el token y datos básicos
    // Ejemplo 1: JSON (útil para desarrollo o SPA)
    // return res.json({ status: "success", user: userDTO, token });

    // Ejemplo 2: Redirección al frontend (ajusta la URL a tu frontend real)
    res.redirect(
      `http://localhost:5173/auth/google/success?token=${token}&name=${encodeURIComponent(userDTO.first_name)}`
    );
  }
);

export default router;