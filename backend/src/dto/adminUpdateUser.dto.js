export default class AdminUpdateUserDTO {
  constructor(body) {
    if (body.role) {
      this.role = body.role;
    }

    if (body.first_name) this.first_name = body.first_name;
    if (body.last_name) this.last_name = body.last_name;
    if (body.email) this.email = body.email;
    if (body.age !== undefined) this.age = Number(body.age);

    if (body.img !== undefined) this.img = body.img;

    // Garantiza que _id esté presente si existe
    if (body._id) this._id = body._id;
    if (body.id && !this._id) this._id = body.id;
  }
}
