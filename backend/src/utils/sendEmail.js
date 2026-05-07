import sgMail from "@sendgrid/mail";
import {env} from "../config/environment.js";

sgMail.setApiKey(env.SENDGRID_API_KEY);

export const sendEmail = async ({ to, subject, text, html, from, attachments }) => {
  const msg = {
    to,
    from: from || "sulsentimaximiliano@gmail.com", // Cambia por tu email verificado en SendGrid
    subject,
    text,
    html,
    attachments: attachments && attachments.length > 0 ? attachments : undefined,
  };
  try {
    await sgMail.send(msg);
    return { ok: true };
  } catch (error) {
    console.error("Error enviando email:", error);
    return { ok: false, error };
  }
};