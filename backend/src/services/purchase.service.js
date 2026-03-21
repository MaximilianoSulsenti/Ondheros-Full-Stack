import { v4 as uuidv4 } from 'uuid';

export default class PurchaseService {
  constructor(cartService, productService, ticketService) {
    this.cartService = cartService;
    this.productService = productService;
    this.ticketService = ticketService;
  }   
     
  async purchaseCart(cartId, userEmail) {
    const cart = await this.cartService.getCartById(cartId);

    const purchased = [];
    const notPurchased = [];

    let total = 0;

    for (const item of cart.products) {
      const product = await this.productService.getProductById(item.product._id || item.product);

      if (product.stock >= item.quantity) {
        product.stock -= item.quantity;
        await this.productService.updateProduct(product._id, { stock: product.stock });

        purchased.push({
          product: product._id,
          quantity: item.quantity,
          price: product.price
        });

        total += product.price * item.quantity;
      } else {
        notPurchased.push(item);
      }
    }

    if (purchased.length === 0) {
      return {
        status: "error",
        message: "No hay stock disponible para ningún producto",
        notPurchased
      };
    }

    const ticket = await this.ticketService.createTicket({
      code: uuidv4(),
      amount: total,
      purchaser: userEmail,
      products: purchased
    });

    await this.cartService.updateCart(cartId, { products: notPurchased });

    return {
      status: "success",
      ticket,
      notPurchased
    };
  }
}