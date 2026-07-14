import ticketModel from "../../models/ticket.model.js";

export default class TicketDAO {
  async create(ticket) {
    return await ticketModel.create(ticket);
  }
  async countTickets() {
    return await ticketModel.countDocuments();
  }
  async getAll() {
    return await ticketModel
      .find()
      .populate("products.product", "nombre precio imagen")
      .sort({ createdAt: -1 });
  }

  async setArchived(ticketId, archived) {
    return await ticketModel
      .findByIdAndUpdate(
        ticketId,
        { archived, archivedAt: archived ? new Date() : null },
        { new: true }
      )
      .populate("products.product", "nombre precio imagen");
  }

  async getByCodeAndPurchaser(code, purchaser) {
    return await ticketModel
      .findOne({ code, purchaser })
      .populate("products.product", "nombre precio imagen");
  }

  async setPaymentStatusByCodeAndPurchaser(code, purchaser, update) {
    const updatePayload = {
      paymentStatus: update.paymentStatus,
      paymentStatusDetail: update.paymentStatusDetail || null,
      paymentId: update.paymentId || null,
      paymentStatusUpdatedAt: new Date()
    };

    if (update.paymentProvider) {
      updatePayload.paymentProvider = update.paymentProvider;
    }

    return await ticketModel
      .findOneAndUpdate(
        { code, purchaser },
        updatePayload,
        { new: true }
      )
      .populate("products.product", "nombre precio imagen");
  }

  async setPaymentStatusByCode(code, update) {
    const updatePayload = {
      paymentStatus: update.paymentStatus,
      paymentStatusDetail: update.paymentStatusDetail || null,
      paymentId: update.paymentId || null,
      paymentStatusUpdatedAt: new Date()
    };

    if (update.paymentProvider) {
      updatePayload.paymentProvider = update.paymentProvider;
    }

    return await ticketModel
      .findOneAndUpdate(
        { code },
        updatePayload,
        { new: true }
      )
      .populate("products.product", "nombre precio imagen");
  }

  async setFulfillmentStatusByCode(code, fulfillmentStatus) {
    return await ticketModel
      .findOneAndUpdate(
        { code },
        {
          fulfillmentStatus,
          fulfillmentStatusUpdatedAt: new Date()
        },
        { new: true }
      )
      .populate("products.product", "nombre precio imagen");
  }
}
