export default class CartsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getCarts() {
    return this.dao.getCarts();
  }

  getCartById(cartId) {
    return this.dao.getCartById(cartId);
  }

  createCart() {
    return this.dao.createCart();
  }

  addProductToCart(cartId, productId, quantity, talla) {
    return this.dao.addProductToCart(cartId, productId, quantity, talla);
  }

  updateCartProducts(cartId, products) {
    return this.dao.updateCartProducts(cartId, products);
  }

  updateProductQuantity(cartId, productId, quantity) {
    return this.dao.updateProductQuantity(cartId, productId, quantity);
  }

  deleteProductFromCart(cartId, productId, talla) {
    return this.dao.deleteProductFromCart(cartId, productId, talla);
  }

  clearCart(cartId) {
    return this.dao.clearCart(cartId);
  }
}
