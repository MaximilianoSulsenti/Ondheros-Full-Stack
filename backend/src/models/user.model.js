import mongoose from "mongoose";

const userCollection = "users";

const userSchema = new mongoose.Schema ({
    first_name: {type: String, required: true},
    last_name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    age: {type: Number, required: true},
    password: {type: String, required: true},
    cart: {type: mongoose.Schema.Types.ObjectId, ref: 'carts'},
    role: {type: String, required: true, default: 'user'},
    img: {type: String, default: ""} // URL o base64 de la foto de perfil
}, { timestamps: true});

const userModel = mongoose.model (userCollection, userSchema)

export default userModel;