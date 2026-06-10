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
}
