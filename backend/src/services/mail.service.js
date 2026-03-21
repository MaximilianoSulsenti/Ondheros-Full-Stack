import nodemailer from "nodemailer";
import { env } from "../config/environment.js";

export default class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: env.MAIL_USER,
        pass: env.MAIL_PASS,
      },
    });
  }

  async sendPasswordReset(email, link) {
    return this.transporter.sendMail({
      from: env.MAIL_USER,
      to: email,
      subject: "Recuperación de contraseña",
      html: `
        <h2>Recuperar contraseña</h2>
        <p>Hacé click en el botón para restablecer tu contraseña</p>
        <a href="${link}" style="
          padding: 10px 15px;
          background: black;
          color: white;
          text-decoration: none;
          border-radius: 5px;
        ">Restablecer contraseña</a>
        <p>Este link expira en 1 hora</p>
      `
    });
  }
}
