import productModel from "../../models/product.model.js";

export default class ProductsDAO {

    getAll = async () => {
        return productModel.find().lean();
    };

    getPaginated = async ({ limit, page, sort, filter }) => {
        return productModel.paginate(filter, {
            limit,
            page,
            sort,
            lean: true
        });
    };

    getById = async (id) => {
        return productModel.findById(id).lean();
    };

    create = async (data) => {
        return productModel.create(data);
    };

    update = async (id, updatedData) => {
        return productModel.findByIdAndUpdate(id, updatedData, { new: true }).lean();
    };

    delete = async (id) => {
        return productModel.findByIdAndDelete(id);
    };

    countProducts = async () => {
        return productModel.countDocuments();
    };
}
