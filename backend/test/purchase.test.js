import { expect } from "chai";
import supertest from "supertest";

const requester = supertest("http://localhost:8080");

describe("Tests de Purchase / Tickets", () => {

  let token;
  let cartId;
  let productId;

  const testEmail = `compra${Date.now()}@gmail.com`;
  const password = "123456";

  before(async () => {

    // 1) Registrar usuario
    const registerRes = await requester.post("/api/users/register").send({
      first_name: "Buyer",
      last_name: "Test",
      email: testEmail,
      age: 25,
      password
    });

    if (registerRes.status !== 201 && registerRes.status !== 200) {
      console.log("ERROR REGISTER:", registerRes.body);
      throw new Error("Falló el registro de usuario");
    }

    // 2) Login
    const loginRes = await requester.post("/api/sessions/login").send({
      email: testEmail,
      password
    });

    if (!loginRes.body.payload?.token) {
      console.log("ERROR LOGIN:", loginRes.body);
      throw new Error("Falló el login");
    }

    token = loginRes.body.payload.token;

    // 3) Crear carrito (requiere token)
    const cartRes = await requester
      .post("/api/carts")
      .set("Authorization", `Bearer ${token}`);

    if (!cartRes.body.payload?._id) {
      console.log("ERROR CREATE CART RESPONSE:", cartRes.body);
      throw new Error("No se pudo crear carrito");
    }

    cartId = cartRes.body.payload._id;

    // 4) Crear producto con stock (requiere token)
    const productRes = await requester
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Producto test compra",
        description: "Producto test",
        price: 100,
        stock: 5,
        category: "test",
        code: `code-${Date.now()}`
      });

    if (!productRes.body.payload?._id) {
      console.log("ERROR CREATE PRODUCT RESPONSE:", productRes.body);
      throw new Error("No se pudo crear producto");
    }

    productId = productRes.body.payload._id;

    // 5) Agregar producto al carrito (requiere token)
    const addRes = await requester
      .post(`/api/carts/${cartId}/product/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 2 });

    if (addRes.status !== 200) {
      console.log("ERROR ADD PRODUCT TO CART:", addRes.body);
      throw new Error("No se pudo agregar producto al carrito");
    }
  });


  it("Debe generar un ticket correctamente", async () => {
    const res = await requester
      .post(`/api/carts/${cartId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.status).to.equal("success");

    expect(res.body.payload).to.have.property("ticket");
    expect(res.body.payload.ticket).to.have.property("code");
    expect(res.body.payload.ticket).to.have.property("amount");
    expect(res.body.payload.ticket).to.have.property("purchaser");

    expect(res.body.payload).to.have.property("productsNotProcessed");
    expect(res.body.payload.productsNotProcessed).to.be.an("array");
  });

  it("Debe descontar stock del producto", async () => {
    const productRes = await requester
      .get(`/api/products/${productId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(productRes.body.payload.stock).to.equal(3); 
  });

  it("Debe manejar compra incompleta por falta de stock", async () => {

    // Agregar más de lo que hay
    const addRes = await requester
      .post(`/api/carts/${cartId}/product/${productId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ quantity: 10 });

    if (addRes.status !== 200) {
      console.log("ERROR ADD OVERSTOCK:", addRes.body);
      throw new Error("No se pudo agregar sobrestock");
    }

    const res = await requester
      .post(`/api/carts/${cartId}/purchase`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.payload.productsNotProcessed.length).to.be.greaterThan(0);
  });

});
