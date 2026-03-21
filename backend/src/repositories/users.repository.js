export default class UsersRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getUsers = async () => {
    return await this.dao.getAll();
  };

  getUserById = async (uid) => {
    return await this.dao.getUserById(uid);
  };

  getByEmail = async (email) => {
    return await this.dao.getByEmail(email);
  }

  createUser = async (userData) => {
    return await this.dao.create(userData);
  };

  updateUser = async (uid, updateData) => {
    return await this.dao.update(uid, updateData);
  };

  deleteUser = async (uid) => {
    return await this.dao.delete(uid);
  };

  // Nuevo método para contar usuarios
  countUsers = async () => {
    return await this.dao.countUsers();
  };
}
