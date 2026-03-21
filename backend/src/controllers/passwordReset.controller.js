export default class PasswordResetController {
  constructor(service) {
    this.service = service;
  }

  requestReset = async (req, res) => {
    try {
      const { email } = req.body;

      await this.service.requestReset(email);

      res.status(200).json({
        status: "success",
        message: "Si el email existe, se envió un correo de recuperación"
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  resetPassword = async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      await this.service.resetPassword(token, newPassword);

      res.status(200).json({
        status: "success",
        message: "Contraseña actualizada correctamente"
      });

    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
