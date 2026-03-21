export default class ProductsRepository {
  constructor(dao) {
    this.dao = dao;
  }

  getAll() {
    return this.dao.getAll();
  }

  getPaginated({ limit, page, sort, filter }) {
    return this.dao.getPaginated({ limit, page, sort, filter });
  }

  getById(id) {
    return this.dao.getById(id);
  }

  create(data) {
    return this.dao.create(data);
  }

  update(id, data) {
    return this.dao.update(id, data);
  }

  delete(id) {
    return this.dao.delete(id);
  }

  countProducts() {
    return this.dao.countProducts();
  }
}
