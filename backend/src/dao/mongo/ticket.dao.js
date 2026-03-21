import ticketModel from "../../models/ticket.model.js";

export default class TicketDAO {
  async create(ticket) {
    return await ticketModel.create(ticket);
  }
  async countTickets() {
    return await ticketModel.countDocuments();
  }
  async getAll() {
    return await ticketModel.find();
  }
}
