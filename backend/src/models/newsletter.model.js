import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  text: { type: String, required: true },
  html: { type: String },
  attachments: [
    {
      filename: { type: String, required: true },
      type: { type: String, required: true },
      size: { type: Number, required: true }
    }
  ],
  sentTo: [String], // lista de emails
  sentBy: { type: String }, // email o id del admin
  sentAt: { type: Date }, // fecha real de envío
  scheduledAt: { type: Date }, // fecha programada
  status: { type: String, enum: ["pendiente", "enviado", "fallido"], default: "enviado" }
});

const NewsletterUltra = mongoose.model("NewsletterUltra", newsletterSchema, "newsletterultras");
export default NewsletterUltra;
