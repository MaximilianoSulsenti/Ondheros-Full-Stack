import sgMail from "@sendgrid/mail";
import {env} from "../config/environment.js";

const SENDGRID_API_KEY = (env.SENDGRID_API_KEY || "").trim();
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}

export const sendEmail = async ({ to, subject, text, html, from, attachments }) => {
  if (!SENDGRID_API_KEY) {
    return {
      ok: false,
      code: "CONFIG_ERROR",
      message: "SENDGRID_API_KEY no está configurada en el backend."
    };
  }

  const msg = {
    to,
    from: from || env.MAIL_FROM || "sulsentimaximiliano@gmail.com", // Debe ser remitente verificado en SendGrid
    subject,
    text,
    html,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
  };
  try {
    await sgMail.send(msg);
    return { ok: true };
  } catch (error) {
    const statusCode = error?.code || error?.response?.statusCode || null;
    const providerMessage = error?.response?.body?.errors?.[0]?.message || error?.message || "Error desconocido enviando email";
    console.error("Error enviando email:", {
      to,
      statusCode,
      providerMessage
    });
    return { ok: false, code: statusCode, message: providerMessage };
  }
};