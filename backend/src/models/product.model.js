import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const productCollection = "products";

const productSchema = new mongoose.Schema({
    nombre : String,
    descripcion : String,
    precio : Number,
    imagen : String,
    categoria : String,
    stock : Number,
    disponible : Boolean
}, { timestamps: true});

productSchema.plugin(mongoosePaginate);

const productModel = mongoose.model (productCollection, productSchema)

export default productModel;