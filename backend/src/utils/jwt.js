import jwt from "jsonwebtoken";
import { env } from "../config/environment.js";

const SECRET_KEY = env.SECRET_KEY;

export function generateToken(user) {
    const payload = {
        id: user._id.toString(),
        email: user.email,
        role: user.role,
    };
    return jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
}

export function verifyToken(token) {
    return jwt.verify(token, SECRET_KEY);
}

export const authToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ status: "error", error: "No token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ status: "error", error: "token invalido" });
    }
};