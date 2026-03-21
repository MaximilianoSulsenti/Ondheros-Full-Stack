export default class CurrentUserDTO {
  constructor(user) {
    this.id = user._id;
    this._id = user._id;
    this.first_name = user.first_name || user.firstName;
    this.last_name = user.last_name || user.lastName;
    this.email = user.email;
    this.role = user.role;
    this.cart = user.cart?.toString?.() || user.cart || null;
    this.img = user.img || null;
  }
}
