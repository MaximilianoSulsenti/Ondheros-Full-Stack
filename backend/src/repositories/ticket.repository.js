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
}