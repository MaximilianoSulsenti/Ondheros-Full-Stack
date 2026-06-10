export default class CartsController {
    constructor(cartService, ticketService) {
        this.cartService = cartService;
        this.ticketService = ticketService;
    }

    // Obtener tickets del usuario autenticado
    getMyTickets = async (req, res) => {
        try {
            const userEmail = req.user?.email;
            if (!userEmail) return res.status(401).json({ error: "No autenticado" });
            const tickets = await this.ticketService.getAllTickets();
            // Filtrar por email del usuario
            const myTickets = tickets.filter(t => t.purchaser === userEmail);
            res.status(200).json({ payload: myTickets });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    createCart = async (req, res) => {
        try {
            const cart = await this.cartService.createCart();
            res.status(201).json({ message: "Carrito creado", payload: cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    getCartById = async (req, res) => {
        try {
            const cart = await this.cartService.getCartById(req.params.cartId);

            if (!cart)
                return res.status(404).json({ msg: "Carrito no encontrado" });

            res.status(200).json({ payload: cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    addProductToCart = async (req, res) => {
        try {
            const { cantidad, quantity, talla } = req.body;
            // Soportar ambos nombres de cantidad por compatibilidad
            const qty = cantidad || quantity;

            const cart = await this.cartService.addProductToCart(
                req.params.cartId,
                req.params.productId,
                qty,
                talla
            );

            if (!cart)
                return res.status(404).json({ msg: "Carrito o producto no encontrado" });

            res.status(200).json({ message: "Producto agregado al carrito", payload: cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    updateCartProducts = async (req, res) => {
        try {
            const cart = await this.cartService.updateCartProducts(req.params.cartId, req.body.products);
            if (!cart)
                return res.status(404).json({ msg: "Carrito no encontrado" });

            res.status(200).json({ message: "Carrito actualizado", payload: cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    updateProductQuantity = async (req, res) => {
        try {
            const cart = await this.cartService.updateProductQuantity(req.params.cartId, req.params.productId, req.body.quantity);

            if (!cart)
                return res.status(404).json({ msg: "Carrito no encontrado" });

            res.status(200).json({ message: "Cantidad de producto actualizada", payload: cart });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    deleteProductFromCart = async (req, res) => {
        try {
            const talla = req.query.talla || null;
            const cart = await this.cartService.deleteProductFromCart(
                req.params.cartId,
                req.params.productId,
                talla
            );
            if (!cart)
                return res.status(404).json({ msg: "carrito no encontrado" });

            res.status(200).json({ message: "Producto eliminado del carrito", payload: cart });

        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    clearCart = async (req, res) => {
        try {
            const cart = await this.cartService.clearCart(req.params.cartId);
            if (!cart)
                return res.status(404).json({ msg: "carrito no encontrado" });

            res.status(200).json({ message: "Carrito vaciado", payload: cart });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    purchaseCart = async (req, res) => {
        try {
            const { cartId } = req.params;
            const purchaser = req.user?.email || "test@purchase.com";

            const result = await this.cartService.purchaseCart(cartId, purchaser);

            return res.status(200).json({
                status: "success",
                payload: {
                    ticket: result.ticket,
                    productsNotProcessed: result.notProcessed
                }
            });

        } catch (error) {
            console.error("Error en purchaseCart:", error);
            res.status(500).json({ status: "error", error: error.message });
        }
    };

    countTickets = async (req, res) => {
        try {
            const count = await this.ticketService.countTickets();
            res.status(200).json({ count });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    getAllTickets = async (req, res) => {
        try {
            const tickets = await this.ticketService.getAllTickets();
            res.status(200).json({ payload: tickets });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    setTicketArchived = async (req, res) => {
        try {
            const { ticketId } = req.params;
            const { archived } = req.body;

            if (typeof archived !== "boolean") {
                return res.status(400).json({ error: "El campo archived debe ser booleano" });
            }

            const ticket = await this.ticketService.setTicketArchived(ticketId, archived);

            if (!ticket) {
                return res.status(404).json({ error: "Pedido no encontrado" });
            }

            res.status(200).json({ message: archived ? "Pedido archivado" : "Pedido desarchivado", payload: ticket });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };
}