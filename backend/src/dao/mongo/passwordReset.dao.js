import passwordResetModel from "../../models/passwordReset.model.js";

export default class PasswordResetDAO {

  create(data) {
    return passwordResetModel.create(data);
  }

  findByToken(token) {
    return passwordResetModel.findOne({token});
  }

  markAsUsed(token) {
    return passwordResetModel.findOneAndUpdate(
      {token},{used: true},{new: true}
    );
  }

  deleteByUser(userId) {
    return passwordResetModel.deleteMany({userId});
  }

  deleteExpired() {
    return passwordResetModel.deleteMany({
      expiresAt: { $lt: new Date() }
    });
  }
}
