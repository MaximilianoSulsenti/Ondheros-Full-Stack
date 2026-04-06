import { Router } from "express";
import { sendEmail } from "../utils/sendEmail.js";
import userModel from "../models/user.model.js";
import { authorize } from "../middlewares/auth.js";
import passport from "passport";
import multer from "multer";
import NewsletterUltra from "../models/newsletter.model.js";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Obtener historial de newsletters
router.get(
  "/newsletter/history",
  passport.authenticate("current", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const page = parseInt(req.query.page, 10) || 1;
      const pageSize = parseInt(req.query.pageSize, 10) || 10;
      const search = req.query.search?.trim() || "";

      // Filtro por asunto o email destinatario
      let filter = {};
      if (search) {
        filter = {
          $or: [
            { subject: { $regex: search, $options: "i" } },
            { sentTo: { $elemMatch: { $regex: search, $options: "i" } } }
          ]
        };
      }

      const total = await NewsletterUltra.countDocuments(filter);
      const totalPages = Math.ceil(total / pageSize);
      const history = await NewsletterUltra.find(filter)
        .sort({ scheduledAt: -1, sentAt: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .select("subject sentBy sentTo attachments sentAt scheduledAt status");

      res.json({ history, totalPages });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

// Endpoint para segmentación: obtener roles y emails por rol
router.get("/newsletter/segments", passport.authenticate("current", { session: false }), authorize("admin"), async (req, res) => {
  try {
    // Obtener todos los roles únicos
    const roles = await userModel.distinct("role");
    // Filtros avanzados
    const { role, filter, search } = req.query;
    let emails = [];
    if (role) {
      let query = { role };
      // Filtro rápido
      if (filter === "activos") {
        query.active = true;
      }
      if (filter === "verificados") {
        query.verified = true;
      }
      if (filter === "activos-verificados") {
        query.active = true;
        query.verified = true;
      }
      // Búsqueda avanzada
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i");
        query.$or = [
          { email: regex },
          { first_name: regex },
          { last_name: regex }
        ];
      }
      const users = await userModel.find(query, "email");
      emails = users.map(u => u.email);
    }
    res.json({ roles, emails });
  } catch (error) {
    res.status(500).json({ status: "error", error: error.message });
  }
});

router.post(
  "/newsletter",
  passport.authenticate("current", { session: false }),
  authorize("admin"),
  upload.array("attachments"),
  async (req, res) => {
    const { subject, text, html, scheduledAt } = req.body;
    const MAX_FILE_SIZE_MB = 10;
    const ALLOWED_TYPES = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'
    ];
    try {
      // Validar archivos
      if (req.files && req.files.length > 0) {
        for (const file of req.files) {
          if (!ALLOWED_TYPES.includes(file.mimetype)) {
            return res.status(400).json({ status: "error", error: `Tipo de archivo no permitido: ${file.originalname}` });
          }
          if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            return res.status(400).json({ status: "error", error: `El archivo ${file.originalname} supera el tamaño máximo de ${MAX_FILE_SIZE_MB}MB.` });
          }
        }
      }

      // Tomar los emails seleccionados desde el frontend
      let emails = [];
      if (Array.isArray(req.body.emails)) {
        emails = req.body.emails;
      } else if (typeof req.body.emails === 'string') {
        emails = [req.body.emails];
      }
      // Filtrar emails válidos y únicos
      emails = emails.filter(e => e)
        .filter((e, i, arr) => arr.indexOf(e) === i);

      // Preparar adjuntos para SendGrid
      let attachments = [];
      if (req.files && req.files.length > 0) {
        attachments = req.files.map(file => ({
          content: file.buffer.toString("base64"),
          filename: file.originalname,
          type: file.mimetype,
          disposition: "attachment"
        }));
      }

      // Guardar newsletter tanto si es programado como si es inmediato
      let status = "enviado";
      let sentAt = null;
      let scheduledDate = scheduledAt ? new Date(scheduledAt) : null;
      const now = new Date();
      if (scheduledDate && scheduledDate > now) {
        status = "pendiente";
      } else {
        sentAt = new Date();
      }

      try {
        // Usar solo req.files para adjuntos, ignorar cualquier campo attachments del body
        // Filtrar solo archivos reales (no strings ni campos de texto)
        const attachments = (req.files || [])
          .filter(f => f && typeof f === 'object' && f.originalname && f.mimetype)
          .map(file => ({
            filename: file.originalname,
            type: file.mimetype,
            size: file.size
          }));
        const newsletterData = {
          subject,
          text,
          html,
          attachments,
          sentTo: emails,
          sentBy: req.user?.email || req.user?._id?.toString() || "admin",
          sentAt,
          scheduledAt: scheduledDate,
          status
        };
        const created = await NewsletterUltra.create(newsletterData);
        // Enviar email solo si es inmediato (no programado)
        if (status === "enviado") {
          // Preparar adjuntos para SendGrid (content base64)
          const sgAttachments = (req.files || []).map(file => ({
            content: file.buffer.toString("base64"),
            filename: file.originalname,
            type: file.mimetype,
            disposition: "attachment"
          }));
          for (const to of emails) {
            if (to) {
              await sendEmail({
                to,
                subject,
                text,
                html: html || `<p>${text}</p>`,
                attachments: sgAttachments.length > 0 ? sgAttachments : undefined
              });
            }
          }
        }
      } catch (err) {
        console.error("[NEWSLETTER] ERROR AL GUARDAR:", err);
        return res.status(500).json({ status: "error", error: err.message, stack: err.stack });
      }

      res.json({ status: "success", message: status === "pendiente" ? "Newsletter programado correctamente." : "Newsletter enviado a todos los usuarios." });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);
// Eliminar newsletter por ID
router.delete(
  "/newsletter/:id",
  passport.authenticate("current", { session: false }),
  authorize("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await NewsletterUltra.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ status: "error", error: "Newsletter no encontrado" });
      res.json({ status: "success", message: "Newsletter eliminado" });
    } catch (error) {
      res.status(500).json({ status: "error", error: error.message });
    }
  }
);

export default router;