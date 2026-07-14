export default class TicketService {
    constructor(repository) {
        this.repository = repository;
    }

    async createTicket(data) {
        return await this.repository.createTicket(data);
    }

    async countTickets() {
        return await this.repository.countTickets();
    }

    async getAllTickets() {
        return await this.repository.getAllTickets();
    }

    async setTicketArchived(ticketId, archived) {
        return await this.repository.setTicketArchived(ticketId, archived);
    }

    async getTicketByCodeAndPurchaser(code, purchaser) {
        return await this.repository.getTicketByCodeAndPurchaser(code, purchaser);
    }

    async setPaymentStatusByCodeAndPurchaser(code, purchaser, update) {
        return await this.repository.setPaymentStatusByCodeAndPurchaser(code, purchaser, update);
    }

    async setPaymentStatusByCode(code, update) {
        return await this.repository.setPaymentStatusByCode(code, update);
    }

    async setFulfillmentStatusByCode(code, fulfillmentStatus) {
        return await this.repository.setFulfillmentStatusByCode(code, fulfillmentStatus);
    }
}

