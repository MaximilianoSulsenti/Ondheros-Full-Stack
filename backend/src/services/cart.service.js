import { adaptProduct } from "../utils/productAdapter.js";

export default class CartService {
      constructor(cartsRepository, productsRepository, ticketRepository) {
        this.cartsRepository = cartsRepository;
        this.productsRepository = productsRepository;
        this.ticketRepository = ticketRepository;
      }

    //obtener todos los carritos
     getCarts() {
        return this.cartsRepository.getCarts();
    }

     getCartById(cartId) {
        return this.cartsRepository.getCartById(cartId);
    }

    //crear nuevo carrito
    async createCart() {
        const newCart = await this.cartsRepository.createCart();
        return newCart;
    }

    //agregar producto al carrito
    addProductToCart(cartId, productId, quantity) {
        return this.cartsRepository.addProductToCart(cartId, productId, quantity);
    }

    //actualiza todos los productos del carrito
    updateCartProducts(cartId, products) {
        return this.cartsRepository.updateCartProducts(cartId, products);
    }

    //actualizar la cantidad de un producto en el carrito
    updateProductQuantity(cartId, productId, quantity) {
        return this.cartsRepository.updateProductQuantity(cartId, productId, quantity);
    }

    //eliminar un producto del carrito
    deleteProductFromCart(cartId, productId) {
        return this.cartsRepository.deleteProductFromCart(cartId, productId);
    }
    
      // eliminar todos los productos del carrito
      clearCart(cartId) {
        return this.cartsRepository.clearCart(cartId);
    }
    
    async purchaseCart(cid, purchaser) {
        const cart = await this.cartsRepository.getCartById(cid);

        if (!cart) throw new Error("Carrito no existe");

         if (!Array.isArray(cart.productos)) {
        throw new Error("Estructura inválida del carrito: productos no es un array");
         }

        let totalAmount = 0;
        const notProcessed = [];
        const processedProducts = [];

        for (const item of cart.productos) {
            const productId = item.product._id || item.product;
            const product = await this.productsRepository.getById(productId);

            if (!product) {
                notProcessed.push(item);
                continue;
            }

            const adapted = adaptProduct(product);
            const price = Number(adapted.price);
            const qty = Number(item.quantity);

            if (isNaN(price) || isNaN(qty)) {
                notProcessed.push(item);
                continue;
            }

            let currentStock = Number (product.stock);

            if (currentStock>= qty) {
                // hay stock
                const newStock = currentStock - qty;
                await this.productsRepository.update(adapted.id, { stock: newStock });

                totalAmount += price * qty;

                processedProducts.push({
                    product: product._id,
                    quantity: qty,
                    price
                });
            } else {
                // no hay stock
                notProcessed.push(item);
            }
        }

         if (isNaN(totalAmount)) {
               throw new Error ("total de compra invalido (NaN)");}

        // crear ticket
        const ticket = await this.ticketRepository.createTicket({
            code: `T-${Date.now()}`,
            purchase_datetime: new Date(),
            amount: totalAmount,
            purchaser,
            products : processedProducts
        });

        // actualizar carrito
        await this.cartsRepository.updateCartProducts(cid, notProcessed);

        return {
            ticket,
            notProcessed
        };
    }

}



