import { Router } from "express";
import passport from "passport";
import { authorize } from "../middlewares/auth.js";
import { env } from "../config/environment.js";

export default function createPaymentRouter(ticketService) {
  const router = Router();

  const mapMercadoPagoStatus = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "approved") return "approved";
    if (normalized === "pending") return "pending";
    if (normalized === "in_process") return "in_process";
    if (normalized === "rejected") return "rejected";
    if (normalized === "cancelled") return "cancelled";
    return "unknown";
  };

  const getWebhookUrl = () => {
    const customWebhookUrl = (env.MERCADOPAGO_WEBHOOK_URL || "").trim();
    if (customWebhookUrl) return customWebhookUrl;

    const backendBase = (env.BACKEND_URL || "").trim().replace(/\/+$/, "");
    if (!backendBase) return "";

    return `${backendBase}/api/payments/mercadopago/webhook`;
  };

  const allowedPaymentStatuses = new Set([
    "pending",
    "approved",
    "in_process",
    "rejected",
    "cancelled",
    "unknown"
  ]);

  const removablePaymentStatuses = new Set([
    "pending",
    "rejected",
    "cancelled",
    "unknown"
  ]);

  router.post(
    "/mercadopago/preference",
    passport.authenticate("current", { session: false }),
    authorize("user", "admin"),
    async (req, res) => {
      try {
        const accessToken = (env.MERCADOPAGO_ACCESS_TOKEN || "").trim();
        if (!accessToken) {
          return res.status(500).json({
            status: "error",
            error: "Falta configurar MERCADOPAGO_ACCESS_TOKEN en backend/.env"
          });
        }

        const { ticketCode } = req.body;
        if (!ticketCode) {
          return res.status(400).json({ status: "error", error: "ticketCode es requerido" });
        }

        const purchaser = req.user?.email;
        if (!purchaser) {
          return res.status(401).json({ status: "error", error: "Usuario no autenticado" });
        }

        const ticket = await ticketService.getTicketByCodeAndPurchaser(ticketCode, purchaser);
        if (!ticket) {
          return res.status(404).json({ status: "error", error: "Ticket no encontrado para este usuario" });
        }

        const items = (ticket.products || [])
          .map((item, idx) => ({
            title: item?.product?.nombre || `Producto ${idx + 1}`,
            quantity: Number(item?.quantity || 0),
            currency_id: "ARS",
            unit_price: Number(item?.price || item?.product?.precio || 0)
          }))
          .filter((item) => item.quantity > 0 && item.unit_price > 0);

        if (items.length === 0) {
          return res.status(400).json({
            status: "error",
            error: "El ticket no tiene items válidos para generar la preferencia"
          });
        }

        const fallbackFrontend = env.ALLOWED_ORIGINS?.split(",")?.[0]?.trim();
        const frontendBaseUrlRaw = env.FRONTEND_URL || fallbackFrontend || "http://localhost:5173";
        const frontendBaseUrl = frontendBaseUrlRaw.replace(/\/+$/, "");

        let validFrontendBaseUrl = frontendBaseUrl;
        try {
          // Normaliza/valida URL para evitar rechazos de Mercado Pago por formato inválido.
          validFrontendBaseUrl = new URL(frontendBaseUrl).toString().replace(/\/+$/, "");
        } catch {
          validFrontendBaseUrl = "http://localhost:5173";
        }

        const successUrl = `${validFrontendBaseUrl}/checkout?payment_status=success&order=${ticket.code}`;
        const failureUrl = `${validFrontendBaseUrl}/checkout?payment_status=failure&order=${ticket.code}`;
        const pendingUrl = `${validFrontendBaseUrl}/checkout?payment_status=pending&order=${ticket.code}`;

        const shouldUseAutoReturn = successUrl.startsWith("https://");
        const webhookUrl = getWebhookUrl();

        const preferencePayload = {
          items,
          payer: {
            email: purchaser
          },
          external_reference: ticket.code,
          statement_descriptor: "ONDHEROS",
          back_urls: {
            success: successUrl,
            failure: failureUrl,
            pending: pendingUrl
          },
          ...(webhookUrl ? { notification_url: webhookUrl } : {}),
          ...(shouldUseAutoReturn ? { auto_return: "approved" } : {})
        };

        const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`
          },
          body: JSON.stringify(preferencePayload)
        });

        const mpData = await mpResponse.json();

        if (!mpResponse.ok) {
          console.error("[MP] Preference creation failed:", JSON.stringify(mpData));
          const mpErrorMsg = mpData?.message || mpData?.cause?.[0]?.description || mpData?.error || JSON.stringify(mpData);
          return res.status(502).json({
            status: "error",
            error: `Mercado Pago: ${mpErrorMsg}`,
            details: mpData
          });
        }

        return res.status(200).json({
          status: "success",
          payload: {
            preferenceId: mpData.id,
            initPoint: mpData.init_point,
            sandboxInitPoint: mpData.sandbox_init_point,
            notificationUrl: webhookUrl || null
          }
        });
      } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
      }
    }
  );

  router.post("/mercadopago/webhook", async (req, res) => {
    try {
      const accessToken = (env.MERCADOPAGO_ACCESS_TOKEN || "").trim();
      if (!accessToken) {
        return res.status(200).json({ status: "ignored", reason: "missing_access_token" });
      }

      const bodyType = req.body?.type || req.body?.topic;
      const queryType = req.query?.type || req.query?.topic;
      const eventType = String(bodyType || queryType || "").toLowerCase();

      const bodyId = req.body?.data?.id || req.body?.id;
      const queryId = req.query?.["data.id"] || req.query?.id;
      const paymentId = bodyId || queryId;

      const isPaymentEvent = eventType === "payment";
      if (!isPaymentEvent || !paymentId) {
        return res.status(200).json({ status: "ignored", reason: "unsupported_event" });
      }

      const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });

      const paymentData = await paymentRes.json();
      if (!paymentRes.ok) {
        console.error("[MP] Webhook payment lookup failed:", JSON.stringify(paymentData));
        return res.status(200).json({ status: "ignored", reason: "payment_lookup_failed" });
      }

      const ticketCode = String(paymentData?.external_reference || "").trim();
      if (!ticketCode) {
        return res.status(200).json({ status: "ignored", reason: "missing_external_reference" });
      }

      const mappedStatus = mapMercadoPagoStatus(paymentData?.status);
      const mappedDetail = String(paymentData?.status_detail || "").trim();

      const updatedTicket = await ticketService.setPaymentStatusByCode(ticketCode, {
        paymentStatus: mappedStatus,
        paymentStatusDetail: mappedDetail,
        paymentId: String(paymentData?.id || paymentId)
      });

      if (!updatedTicket) {
        return res.status(200).json({ status: "ignored", reason: "ticket_not_found" });
      }

      return res.status(200).json({
        status: "ok",
        payload: {
          ticketCode,
          paymentStatus: mappedStatus
        }
      });
    } catch (error) {
      console.error("[MP] Webhook error:", error.message);
      return res.status(200).json({ status: "ignored", reason: "webhook_exception" });
    }
  });

  router.patch(
    "/mercadopago/tickets/:ticketCode/status",
    passport.authenticate("current", { session: false }),
    authorize("user", "admin"),
    async (req, res) => {
      try {
        const ticketCode = (req.params.ticketCode || "").trim();
        const purchaser = req.user?.email;
        const paymentStatus = (req.body?.paymentStatus || "").trim();
        const paymentStatusDetail = (req.body?.paymentStatusDetail || "").trim();
        const paymentIdRaw = req.body?.paymentId;
        const paymentId = paymentIdRaw == null ? "" : String(paymentIdRaw).trim();

        if (!ticketCode) {
          return res.status(400).json({ status: "error", error: "ticketCode es requerido" });
        }

        if (!purchaser) {
          return res.status(401).json({ status: "error", error: "Usuario no autenticado" });
        }

        if (!allowedPaymentStatuses.has(paymentStatus)) {
          return res.status(400).json({
            status: "error",
            error: "paymentStatus invalido"
          });
        }

        const ticket = await ticketService.setPaymentStatusByCodeAndPurchaser(ticketCode, purchaser, {
          paymentStatus,
          paymentStatusDetail,
          paymentId
        });

        if (!ticket) {
          return res.status(404).json({ status: "error", error: "Ticket no encontrado para este usuario" });
        }

        return res.status(200).json({ status: "success", payload: ticket });
      } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
      }
    }
  );

  router.patch(
    "/whatsapp/tickets/:ticketCode/submit",
    passport.authenticate("current", { session: false }),
    authorize("user", "admin"),
    async (req, res) => {
      try {
        const ticketCode = (req.params.ticketCode || "").trim();
        const purchaser = req.user?.email;

        if (!ticketCode) {
          return res.status(400).json({ status: "error", error: "ticketCode es requerido" });
        }

        if (!purchaser) {
          return res.status(401).json({ status: "error", error: "Usuario no autenticado" });
        }

        const ticket = await ticketService.setPaymentStatusByCodeAndPurchaser(ticketCode, purchaser, {
          paymentStatus: "in_process",
          paymentStatusDetail: "whatsapp_order_sent",
          paymentProvider: "whatsapp",
          paymentId: ""
        });

        if (!ticket) {
          return res.status(404).json({ status: "error", error: "Ticket no encontrado para este usuario" });
        }

        return res.status(200).json({ status: "success", payload: ticket });
      } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
      }
    }
  );

  router.patch(
    "/whatsapp/admin/tickets/:ticketCode/status",
    passport.authenticate("current", { session: false }),
    authorize("admin"),
    async (req, res) => {
      try {
        const ticketCode = (req.params.ticketCode || "").trim();
        const paymentStatus = (req.body?.paymentStatus || "").trim();
        const paymentStatusDetail = (req.body?.paymentStatusDetail || "").trim();

        if (!ticketCode) {
          return res.status(400).json({ status: "error", error: "ticketCode es requerido" });
        }

        if (!allowedPaymentStatuses.has(paymentStatus)) {
          return res.status(400).json({ status: "error", error: "paymentStatus invalido" });
        }

        const updatedTicket = await ticketService.setPaymentStatusByCode(ticketCode, {
          paymentStatus,
          paymentStatusDetail,
          paymentProvider: "whatsapp",
          paymentId: ""
        });

        if (!updatedTicket) {
          return res.status(404).json({ status: "error", error: "Ticket no encontrado" });
        }

        return res.status(200).json({ status: "success", payload: updatedTicket });
      } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
      }
    }
  );

  router.patch(
    "/admin/tickets/:ticketCode/fulfillment",
    passport.authenticate("current", { session: false }),
    authorize("admin"),
    async (req, res) => {
      try {
        const ticketCode = (req.params.ticketCode || "").trim();
        const fulfillmentStatus = (req.body?.fulfillmentStatus || "").trim();

        if (!ticketCode) {
          return res.status(400).json({ status: "error", error: "ticketCode es requerido" });
        }

        if (!["pending", "delivered", "cancelled"].includes(fulfillmentStatus)) {
          return res.status(400).json({ status: "error", error: "fulfillmentStatus invalido" });
        }

        const updatedTicket = await ticketService.setFulfillmentStatusByCode(ticketCode, fulfillmentStatus);
        if (!updatedTicket) {
          return res.status(404).json({ status: "error", error: "Ticket no encontrado" });
        }

        return res.status(200).json({ status: "success", payload: updatedTicket });
      } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
      }
    }
  );

  router.patch(
    "/mercadopago/tickets/:ticketCode/cancel",
    passport.authenticate("current", { session: false }),
    authorize("user", "admin"),
    async (req, res) => {
      try {
        const ticketCode = (req.params.ticketCode || "").trim();
        const purchaser = req.user?.email;

        if (!ticketCode) {
          return res.status(400).json({ status: "error", error: "ticketCode es requerido" });
        }

        if (!purchaser) {
          return res.status(401).json({ status: "error", error: "Usuario no autenticado" });
        }

        const ticket = await ticketService.getTicketByCodeAndPurchaser(ticketCode, purchaser);
        if (!ticket) {
          return res.status(404).json({ status: "error", error: "Ticket no encontrado para este usuario" });
        }

        if (!removablePaymentStatuses.has(ticket.paymentStatus)) {
          return res.status(409).json({
            status: "error",
            error: "Solo se pueden eliminar pedidos no pagados"
          });
        }

        const archivedTicket = await ticketService.setTicketArchived(ticket._id, true);
        return res.status(200).json({ status: "success", payload: archivedTicket });
      } catch (error) {
        return res.status(500).json({ status: "error", error: error.message });
      }
    }
  );

  return router;
}
