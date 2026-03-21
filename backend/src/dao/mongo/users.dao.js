import userModel from "../../models/user.model.js";


export default class UsersDAO {

    getAll = async () => {
        return userModel.find().lean();
    };

    getUserById = async (uid) => {
        return userModel.findById(uid).lean();
    };

    getByEmail = async (email) => {
        return userModel.findOne({email}).lean();
    }

    create = async (userData) => {
        return userModel.create(userData);
    };

    update = async (uid, updateData) => {
        return userModel.findByIdAndUpdate(uid, updateData, { new: true }).lean();
    };

    delete = async (uid) => {
        return userModel.findByIdAndDelete(uid);
    };

    // Nuevo método para contar usuarios
    countUsers = async () => {
        return userModel.countDocuments();
    };
}
