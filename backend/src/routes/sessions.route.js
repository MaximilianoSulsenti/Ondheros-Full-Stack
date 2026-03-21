import { Router } from "express";
import passport from "passport";
import { generateToken } from "../utils/jwt.js";
import CurrentUserDTO from "../dto/currentUser.dto.js";

const router = Router();

router.post("/login", passport.authenticate("login", { session: false }), (req, res) => {
    const user = req.user;
    const token = generateToken(user);

    res.status(200).json({
        status: "success",
        user: new CurrentUserDTO(user),
        token
    });
});


router.get("/current", passport.authenticate("current", { session: false }), (req, res) => {

    res.status(200).json({ status: "success", payload: new CurrentUserDTO(req.user) });
});


router.post("/logout", (req, res) => {

    res.status(200).json({ status: "success", message: "Logout exitoso (token invalidado en cliente)" });
});


export default router;