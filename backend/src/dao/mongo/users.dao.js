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

    // Método para obtener usuarios paginados
    getPaginated = async ({ page = 1, limit = 10, search = "", role }) => {
        const query = {};
        if (search) {
            query.$or = [
                { first_name: { $regex: search, $options: "i" } },
                { last_name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ];
        }
        if (role) {
            query.role = role;
        }
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            userModel.find(query).skip(skip).limit(limit).lean(),
            userModel.countDocuments(query)
        ]);
        return { users, total };
    };
}
