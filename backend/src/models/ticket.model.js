import mongoose from "mongoose";

const ticketCollection = "tickets";

const ticketSchema = new mongoose.Schema ({
    code: {type: String, required: true , unique: true},
    purchase_datetime: {type: Date, default: Date.now},
    amount: {type: Number, required: true},
    purchaser: {type: String, required: true},
    paymentStatus: {
        type: String,
        enum: ["pending", "approved", "in_process", "rejected", "cancelled", "unknown"],
        default: "pending"
    },
    paymentProvider: { type: String, default: "mercadopago" },
    paymentId: { type: String, default: null },
    paymentStatusDetail: { type: String, default: null },
    paymentStatusUpdatedAt: { type: Date, default: null },
    fulfillmentStatus: {
        type: String,
        enum: ["pending", "delivered", "cancelled"],
        default: "pending"
    },
    fulfillmentStatusUpdatedAt: { type: Date, default: null },
    archived: { type: Boolean, default: false },
    archivedAt: { type: Date, default: null },
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