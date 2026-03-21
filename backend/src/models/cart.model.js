import mongoose from "mongoose";

const cartCollection = "carts";

const cartSchema = new mongoose.Schema ({
    productos : [
        {
            product: {type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true},
            quantity: {type: Number, required: true, default: 1}
        }
    ], 
      default: []
}, { timestamps: true});

const cartModel = mongoose.model (cartCollection, cartSchema)

export default cartModel;
