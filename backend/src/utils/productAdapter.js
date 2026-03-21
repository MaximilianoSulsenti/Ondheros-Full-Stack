export const adaptProduct = (product) => {
  if (!product) return null;

  const price = Number(product.precio ?? product.price);

  return {
    id: product._id,
    price: isNaN(price) ? 0 : price,
    stock: Number(product.stock),
    raw: product
  };
};
