export default class CreateUserDTO {
  constructor(body) {
    this.first_name =
      body.first_name ||
      body.firstName ||
      body.nombre ||
      body.name;

    this.last_name =
      body.last_name ||
      body.lastName ||
      body.apellido ||
      body.surname;

    this.email =
      body.email ||
      body.mail;

    this.age = Number(body.age);
    this.img = body.img || null;

    if (!this.first_name || !this.last_name || !this.email) {
      throw new Error("Datos de usuario incompletos");
    }
  }
}
