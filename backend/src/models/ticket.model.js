import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema ({
    code: {type: String, required: true , unique: true},
    purchase_datetime: {type: Date, default: Date.now},
    amount: {type: Number, required: true},
    purchaser: {type: String, required: true},
    products: [
                {
            product: {type: mongoose.Schema.Types.ObjectId, ref: 'products', required: true},
            quantity: {type: Number, required: true},
            price: {type: Number, required: true}
        }
    ]
}, { timestamps: true});

const ticketModel = mongoose.model(ticketCollection, ticketSchema);

export default ticketModel;