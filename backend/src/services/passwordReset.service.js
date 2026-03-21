import crypto from "crypto";
import { createHash, isValidPassword } from "../utils/hash.js";
import { env } from "../config/environment.js";

export default class PasswordResetService {
  constructor(passwordResetRepository, usersRepository, mailService) {
    this.resetRepository = passwordResetRepository;
    this.usersRepository = usersRepository;
    this.mailService = mailService;
  }

  // solicitar reseteo de contraseña
  async requestReset(email) {
    const user = await this.usersRepository.getByEmail(email);
    if (!user) return; 

    // borrar tokens anteriores
    await this.resetRepository.deleteByUser(user._id);

    // generar token seguro
    const token = crypto.randomBytes(32).toString("hex");
     
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);// 1 hora de validez

    await this.resetRepository.create({
      userId: user._id,
      token,
      expiresAt
    });

const resetLink = `${env.BACKEND_URL}/api/password/reset-password?token=${token}`;

    await this.mailService.sendPasswordReset(user.email, resetLink);
  }

  // resetear contraseña usando el token
  async resetPassword(token, newPassword) {
    const tokenData = await this.resetRepository.findByToken(token);

    if (!tokenData)
      throw new Error("Token inválido");

    if (tokenData.used)
      throw new Error("Token ya utilizado");

    if (Date.now() > tokenData.expiresAt.getTime())
      throw new Error("Token expirado");

    const user = await this.usersRepository.getUserById(tokenData.userId);

    if (!user)
      throw new Error("Usuario no existe");

    // evitar misma contraseña
    if (isValidPassword(newPassword, user.password))
      throw new Error("La nueva contraseña no puede ser igual a la anterior");

    const hashedPassword = createHash(newPassword);

    await this.usersRepository.updateUser(user._id, {
      password: hashedPassword
    });

    await this.resetRepository.markAsUsed(token);

    // limpieza
    await this.resetRepository.deleteByUser(user._id);

    return true;
  }
}
