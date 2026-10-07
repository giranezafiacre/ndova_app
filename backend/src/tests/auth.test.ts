import request from "supertest";
import app from "../app";
import { User } from "../models";

// Unique email so this test user never collides with seeded data
const TEST_EMAIL = `testuser_${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPass@123";

let authToken = ""; // set after login test

afterAll(async () => {
  // Clean up the test-registered user. UserRole cascades via FK constraint.
  await User.destroy({ where: { email: TEST_EMAIL } });
});

// ---------------------------------------------------------------------------
// POST /api/auth/register
// ---------------------------------------------------------------------------
describe("POST /api/auth/register", () => {
  it("201 — registers a new user and returns token + safe user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "CLIENT",
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user).toMatchObject({
      email: TEST_EMAIL,
      roles: ["CLIENT"],
    });
    // passwordHash must never be exposed
    expect(res.body.data.user).not.toHaveProperty("passwordHash");
  });

  it("409 — rejects duplicate email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "User",
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      role: "CLIENT",
    });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("400 — rejects missing required fields", async () => {
    const res = await request(app).post("/api/auth/register").send({
      email: "nofirstname@example.com",
      password: "Pass@1234",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400 — rejects invalid email format", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Bad",
      lastName: "Email",
      email: "not-an-email",
      password: "Pass@1234",
      role: "CLIENT",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("400 — rejects password shorter than 8 characters", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Short",
      lastName: "Pass",
      email: "short@example.com",
      password: "123",
      role: "CLIENT",
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("201 — registers a provider with the PROVIDER role", async () => {
    const providerEmail = `testprovider_${Date.now()}@example.com`;
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Test",
      lastName: "Provider",
      email: providerEmail,
      password: TEST_PASSWORD,
      role: "PROVIDER",
    });

    expect(res.status).toBe(201);
    expect(res.body.data.user.roles).toEqual(["PROVIDER"]);
    await User.destroy({ where: { email: providerEmail } });
  });

  it("400 — does not allow public ADMIN registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      firstName: "Bad",
      lastName: "Admin",
      email: `testadmin_${Date.now()}@example.com`,
      password: TEST_PASSWORD,
      role: "ADMIN",
    });

    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/auth/login
// Uses the seeded client user so we don't depend on the registration test.
// ---------------------------------------------------------------------------
describe("POST /api/auth/login", () => {
  it("200 — logs in with valid credentials and returns token", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "client@ndova.com",
      password: "Client@123",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("token");
    expect(res.body.data.user.email).toBe("client@ndova.com");
    expect(res.body.data.user).not.toHaveProperty("passwordHash");

    authToken = res.body.data.token;
  });

  it("401 — rejects wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "client@ndova.com",
      password: "wrongpassword",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("401 — rejects unknown email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@example.com",
      password: "Pass@1234",
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /api/auth/me
// ---------------------------------------------------------------------------
describe("GET /api/auth/me", () => {
  it("200 — returns profile when a valid token is provided", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("email", "client@ndova.com");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("401 — rejects request with no token", async () => {
    const res = await request(app).get("/api/auth/me");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("401 — rejects request with a malformed token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer this.is.not.a.valid.jwt");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("401 — rejects request with a token signed by a different secret", async () => {
    const fakeToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" +
      ".eyJ1c2VySWQiOiJmYWtlIiwiZW1haWwiOiJmYWtlQGV4YW1wbGUuY29tIiwicm9sZXMiOltdLCJpYXQiOjF9" +
      ".invalidsignature";

    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${fakeToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
