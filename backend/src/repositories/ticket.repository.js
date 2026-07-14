export default class TicketRepository {
    constructor(dao) {
        this.dao = dao;
    }

    createTicket(ticket) {
        return this.dao.create(ticket);
    }

    countTickets() {
        return this.dao.countTickets();
    }

    getAllTickets() {
        return this.dao.getAll();
    }

    setTicketArchived(ticketId, archived) {
        return this.dao.setArchived(ticketId, archived);
    }

    getTicketByCodeAndPurchaser(code, purchaser) {
        return this.dao.getByCodeAndPurchaser(code, purchaser);
    }

    setPaymentStatusByCodeAndPurchaser(code, purchaser, update) {
        return this.dao.setPaymentStatusByCodeAndPurchaser(code, purchaser, update);
    }

    setPaymentStatusByCode(code, update) {
        return this.dao.setPaymentStatusByCode(code, update);
    }

    setFulfillmentStatusByCode(code, fulfillmentStatus) {
        return this.dao.setFulfillmentStatusByCode(code, fulfillmentStatus);
    }
}