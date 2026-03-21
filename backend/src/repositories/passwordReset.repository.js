export default class PasswordResetRepository {
  constructor(dao) {
    this.dao = dao;
  }

  create(data) {
    return this.dao.create(data);
  }

  findByToken(token) {
    return this.dao.findByToken(token);
  }

  markAsUsed(token) {
    return this.dao.markAsUsed(token);
  }

  deleteByUser(userId) {
    return this.dao.deleteByUser(userId);
  }

  deleteExpired() {
    return this.dao.deleteExpired();
  }
}
