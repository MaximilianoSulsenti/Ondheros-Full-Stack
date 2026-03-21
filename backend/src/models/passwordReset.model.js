import mongoose from "mongoose";

const passwordResetCollection = "password_resets";

const passwordResetSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "users",
    required: true
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true
  },
  used: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

const passwordResetModel = mongoose.model(passwordResetCollection, passwordResetSchema);

export default passwordResetModel;
