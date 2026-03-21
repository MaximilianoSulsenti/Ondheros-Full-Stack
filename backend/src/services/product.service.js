export default class ProductService {
    constructor(productsRepository) {
        this.productsRepository = productsRepository;
    }
    
  getProducts() {
    return this.productsRepository.getAll();
  }

  getProductsPaginated({ limit = 10, page = 1, sort, query }) {
        const filter = {};

        // FILTRO GENERAL
        if (query) {
            if (query === "disponible") filter.disponible = true;
            else filter.categoria = query;
        }

        let sortOption = {};
        if (sort === "asc") sortOption = { price: 1 };
        if (sort === "desc") sortOption = { price: -1 };

       return this.productsRepository.getPaginated({ limit, page, sort: sortOption, filter });

      }

  getProductById(id) {
    return this.productsRepository.getById(id);
  }

  createProduct(data) {
    return this.productsRepository.create(data);
  }

  updateProduct(id, updatedData) {
    return this.productsRepository.update(id, updatedData);
  }

  deleteProduct(id) {
   return this.productsRepository.delete(id);
  }

  countProducts() {
    return this.productsRepository.countProducts();
  }
}
