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
}

