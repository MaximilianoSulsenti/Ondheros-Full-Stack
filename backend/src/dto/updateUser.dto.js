export default class UpdateUserDTO {
  constructor(body) {
    if (body.first_name || body.firstName) {
      this.first_name = body.first_name || body.firstName;
    }

    if (body.last_name || body.lastName || body.apellido) {
      this.last_name = body.last_name || body.lastName || body.apellido;
    }

    if (body.age !== undefined) {
      this.age = body.age;
    }

    if (body.img !== undefined) {
      this.img = body.img;
    }

    // Garantiza que _id esté presente si existe
    if (body._id) this._id = body._id;
    if (body.id && !this._id) this._id = body.id;
  }
}
