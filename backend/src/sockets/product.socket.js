export default function initProductSocket (io, productService) {

    // Socket.io para productos en tiempo real
 io.on("connection", async socket => {
  console.log("Cliente conectado:", socket.id);

  // Enviar lista inicial desde Mongo
  socket.emit("productos_actualizados", await productService.getProducts());

  socket.on("nuevo_producto", async data => {
    await productService.createProduct(data);
    io.emit("productos_actualizados", await productService.getProducts());
  });

  socket.on("eliminar_producto", async id => {
    await productService.deleteProduct(id);
    io.emit("productos_actualizados", await productService.getProducts());
  });
});

}