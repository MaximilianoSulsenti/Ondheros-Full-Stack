export default class AdminUserDTO {
    constructor(user) {
        this.id = user._id;
        this._id = user._id;
        this.first_name = user.first_name || user.firstName;
        this.last_name = user.last_name || user.lastName;
        this.name = `${this.first_name} ${this.last_name}`;
        this.email = user.email;
        this.role = user.role;
        this.age = user.age;
        this.cart = user.cart;
        this.img = user.img || null;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
