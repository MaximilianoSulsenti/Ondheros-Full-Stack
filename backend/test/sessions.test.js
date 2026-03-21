import { expect } from "chai";
import supertest from "supertest";

const requester = supertest("http://localhost:8080");

describe("Tests de Sessions", () => {

  let token;
  const testEmail = `test${Date.now()}@gmail.com`;
  const password = "123456";

  it("Debe registrar un usuario correctamente", async () => {
    const userMock = {
      first_name: "Test",
      last_name: "User",
      email: testEmail,
      age: 30,
      password
    };

    const res = await requester
      .post("/api/users/register")
      .send(userMock);

    expect(res.status).to.equal(201);
    expect(res.body.status).to.equal("success");
  });

  it("Debe loguear al usuario y devolver un token", async () => {
    const loginMock = {
      email: testEmail,
      password
    };

    const res = await requester
      .post("/api/sessions/login")
      .send(loginMock);

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.property("token");
    expect(res.body.payload.token).to.be.a("string");

    token = res.body.payload.token;
  });

  it("Debe devolver el usuario actual con JWT válido", async () => {
    const res = await requester
      .get("/api/sessions/current")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).to.equal(200);
    expect(res.body.payload).to.have.property("email");
    expect(res.body.payload).to.not.have.property("password");
  });

  it("Debe fallar si no se envía token", async () => {
    const res = await requester.get("/api/sessions/current");
    expect(res.status).to.equal(401);
  });

});
