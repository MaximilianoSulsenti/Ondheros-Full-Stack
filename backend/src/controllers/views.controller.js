export default class ViewsController {
  constructor(viewsService) {
    this.viewsService = viewsService;
  }

  home = async (req, res) => {
    try {
      const data = await this.viewsService.getHomeData();
      res.render("home", data);
    } catch (error) {
      res.status(500).send("Error al cargar productos");
    }
  };

  realtime = (req, res) => {
    res.render("realtimeproducts");
  };

  products = async (req, res) => {
    try {
      const data = await this.viewsService.getProductsView(req.query);
      res.render("products", data);
    } catch (error) {
      res.status(500).send("Error al cargar productos");
    }
  };

  cartById = async (req, res) => {
    try {
      const data = await this.viewsService.getCartById(req.params.cid);
      res.render("cart", data);
    } catch (error) {
      res.status(500).send("Error al cargar el carrito");
    }
  };

  cartView = async (req, res) => {
    try {
      const data = await this.viewsService.getCartView(req.params.cartId);
      res.render("carrito", data);
    } catch (error) {
      res.status(500).send(error.message);
    }
  };
}
