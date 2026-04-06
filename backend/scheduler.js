import cron from "node-cron";
import mongoose from "mongoose";
import NewsletterUltra from "./src/models/newsletter.model.js";
import userModel from "./src/models/user.model.js";
import { sendEmail } from "./src/utils/sendEmail.js";
import dotenv from "dotenv";

dotenv.config();

// Conexión a la base de datos si se ejecuta por separado
if (!mongoose.connection.readyState) {
  const MONGO_URI = process.env.MONGO_URI_DEV || "mongodb+srv://sulsentimaximiliano_db_user:TbfYqIvysujWgrp8@cluster0.tscagks.mongodb.net/Ondheros-fullstack";
  mongoose.connect(MONGO_URI);
}

cron.schedule("* * * * *", async () => {
  try {
    const now = new Date();
    // Buscar newsletters pendientes cuya fecha programada ya pasó
    const newsletters = await NewsletterUltra.find({
      status: "pendiente",
      scheduledAt: { $lte: now }
    });
    for (const nl of newsletters) {
      // Obtener destinatarios
      let users = await userModel.find({ email: { $in: nl.sentTo } }, "email");
      let emails = users.map(u => u.email);
      // Enviar a cada destinatario
      for (const to of emails) {
        await sendEmail({
          to,
          subject: nl.subject,
          text: nl.text,
          html: nl.html || `<p>${nl.text}</p>`,
          attachments: (nl.attachments || []).map(a => ({
            filename: a.filename,
            type: a.type,
            content: a.content // Si guardas el base64, si no, omite
          }))
        });
      }
      // Marcar como enviado
      nl.status = "enviado";
      nl.sentAt = new Date();
      await nl.save();
      console.log(`Newsletter enviado: ${nl.subject}`);
    }
  } catch (err) {
    console.error("Error en job de newsletters programados:", err);
  }
});
