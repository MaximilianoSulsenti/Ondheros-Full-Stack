
export default class UserService {
    constructor(repository) {
        this.repository = repository;
    }

    // Obtener todos los usuarios
    async getUsers() {
        return await this.repository.getUsers();
    }

    // Obtener usuario por ID
    async getUserById(uid) {
        return await this.repository.getUserById(uid);
    }

    async getByEmail(email) {
        return await this.repository.getByEmail(email);
    }

    async createUser(userData) {
        return await this.repository.createUser(userData);
    }

    async updateUser(uid, updateData) {
        return await this.repository.updateUser(uid, updateData);
    }

    async deleteUser(uid) {
        return await this.repository.deleteUser(uid);
    }

    // Nuevo método para contar usuarios
    async countUsers() {
        return await this.repository.countUsers();
    }
}
