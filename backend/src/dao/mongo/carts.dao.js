import cartModel from "../../models/cart.model.js";
import productModel from "../../models/product.model.js";

export default class CartsDAO {

    getCarts() {
        return cartModel.find().populate("productos.product").lean();
    }

    getCartById(cartId) {
        return cartModel.findById(cartId).populate("productos.product").lean();
    }

    async createCart() {
        return await cartModel.create({ productos: [] });
    }

    async addProductToCart(cartId, productId, quantity = 1) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        const productExists = await productModel.findById(productId);
        if (!productExists) return null;

        const  qty = Number(quantity) || 1;

        const productInCart = cart.productos.find(
            p => p.product.toString() === productId.toString()
        );

        if (productInCart) {
            productInCart.quantity += qty;
        } else {
            cart.productos.push({ product: productId, quantity: qty });
        }

        await cart.save();
        return this.getCartById(cartId);
    }

    async updateCartProducts(cartId, products) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        cart.productos = products;
        await cart.save();

        return this.getCartById(cartId);
    }

    async updateProductQuantity(cartId, productId, quantity) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        const productInCart = cart.productos.find(
            p => p.product.toString() === productId.toString()
        );
        if (!productInCart) return null;

        productInCart.quantity = quantity;
        await cart.save();

        return this.getCartById(cartId);
    }

    async deleteProductFromCart(cartId, productId) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        cart.productos = cart.productos.filter(
            p => p.product.toString() !== productId.toString()
        );

        await cart.save();
        return this.getCartById(cartId);
    }

    async clearCart(cartId) {
        const cart = await cartModel.findById(cartId);
        if (!cart) return null;

        cart.productos = [];
        await cart.save();

        return this.getCartById(cartId);
    }
}
