export default class ProductsController {
    constructor(productService) {
        this.productService = productService;
    }

//get con paginacion, filtros y orden
    getProducts = async (req, res) => {
          try {
              const limit = parseInt(req.query.limit) || 10;
              const page = parseInt(req.query.page) || 1;
              const sort = req.query.sort;         
              const query = req.query.query;            
      
              const result = await this.productService.getProductsPaginated({limit, page, sort, query });
      
              // Construcción automática de links
              const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;
      
              const buildLink = (newPage) => {
                  return `${baseUrl}?limit=${limit}&page=${newPage}`
                       + (sort ? `&sort=${sort}` : "")
                       + (query ? `&query=${query}` : "");
              };
      
              res.status(200).json({
                  status: "success",
                  payload: result.docs,
                  totalPages: result.totalPages,
                  page: result.page,
                  hasPrevPage: result.hasPrevPage,
                  hasNextPage: result.hasNextPage,
                  prevPage: result.prevPage,
                  nextPage: result.nextPage,
                  prevLink: result.hasPrevPage ? buildLink(result.prevPage) : null,
                  nextLink: result.hasNextPage ? buildLink(result.nextPage) : null
              });
      
          } catch (error) {
              res.status(500).json({ error: error.message });
          }
      };

      getProductById = async (req, res) => {
        try {
            const product = await this.productService.getProductById(req.params.productId);

            if (!product)
                return res.status(404).json({ payload: null, msg: "Producto no encontrado" });

            res.status(200).json({ payload: product });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };


    createProduct = async (req, res) => {
        try {
            const productData = req.body;
            if (req.file && req.file.path) {
                productData.imagen = req.file.path; // URL de Cloudinary
            }
            const newProduct = await this.productService.createProduct(productData);
            res.status(201).json({message: "Producto creado", payload: newProduct});
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };


    updateProduct = async (req, res) => {
        try {
            const productData = req.body;
            if (req.file && req.file.path) {
                productData.imagen = req.file.path;
            }
            const updated = await this.productService.updateProduct(req.params.productId, productData);

            if (!updated)
                return res.status(404).json({ msg: "Producto no encontrado" });

            res.status(200).json({message: "Producto actualizado", payload: updated});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    };

    deleteProduct = async (req, res) => {
        try {
            const deleted = await this.productService.deleteProduct(req.params.productId);

            if (!deleted)
                return res.status(404).json({ msg: "Producto no encontrado" });

            res.status(200).json({message: "Producto eliminado", payload: deleted});
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Nuevo método para contar productos
    countProducts = async (req, res) => {
        try {
            const count = await this.productService.countProducts();
            res.json({ count });
        } catch (error) {
            res.status(500).json({ error: "Error al contar productos" });
        }
    }
}