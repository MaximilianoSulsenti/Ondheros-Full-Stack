export default class ViewsService {
  constructor(productService, cartService) {
    this.productService = productService;
    this.cartService = cartService;
  }

  async getHomeData() {
    const productos = await this.productService.getProducts();
    return { productos };
  }

  async getProductsView(queryParams) {
    const limit = parseInt(queryParams.limit) || 10;
    const page = parseInt(queryParams.page) || 1;
    const sort = queryParams.sort;
    const query = queryParams.query;

    const result = await this.productService.getProductsPaginated({
      limit, page, sort, query
    });

    return {
      title: "Productos",
      products: result.docs,
      totalPages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
      prevLink: result.prevLink,
      nextLink: result.nextLink,
      cartId: "692f9013d6b4154d791e0445"
    };
  }

  async getCartById(cartId) {
    const cart = await this.cartService.getCartById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    return {
      title: "Mi Carrito",
      cart
    };
  }

  async getCartView(cartId) {
    const cart = await this.cartService.getCartById(cartId);
    if (!cart) throw new Error("Carrito no encontrado");

    for (let item of cart.productos) {
      const product = await this.cartService.getProductById(item.product);
      item.product = product;
    }

    return {
      cart
    };
  }
}
