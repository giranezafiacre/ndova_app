import request from "supertest";
import app from "../app";
import { Service } from "../models";

let adminToken = "";
let clientToken = "";
let createdServiceId = "";

beforeAll(async () => {
  const [adminRes, clientRes] = await Promise.all([
    request(app)
      .post("/api/auth/login")
      .send({ email: "admin@ndova.com", password: "Admin@123" }),
    request(app)
      .post("/api/auth/login")
      .send({ email: "client@ndova.com", password: "Client@123" }),
  ]);
  adminToken = adminRes.body.data.token;
  clientToken = clientRes.body.data.token;
});

afterAll(async () => {
  // Clean up service created during tests
  if (createdServiceId) {
    await Service.destroy({ where: { id: createdServiceId } }).catch(() => {});
  }
});

// ---------------------------------------------------------------------------
// GET /api/services  (public)
// ---------------------------------------------------------------------------
describe("GET /api/services", () => {
  it("200 — returns active services without authentication", async () => {
    const res = await request(app).get("/api/services");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    // All returned services must be active
    res.body.data.forEach((s: any) => expect(s.isActive).toBe(true));
  });
});

// ---------------------------------------------------------------------------
// POST /api/services  (ADMIN only)
// ---------------------------------------------------------------------------
describe("POST /api/services", () => {
  it("201 — ADMIN creates a new service", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Test Service",
        description: "Created during automated tests.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      name: "Test Service",
      isActive: true,
    });

    createdServiceId = res.body.data.id;
  });

  it("403 — CLIENT is forbidden from creating a service", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ name: "Sneaky Service" });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("401 — unauthenticated request is rejected", async () => {
    const res = await request(app)
      .post("/api/services")
      .send({ name: "No Auth Service" });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("400 — rejects missing name", async () => {
    const res = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// GET /api/services/:id  (public)
// ---------------------------------------------------------------------------
describe("GET /api/services/:id", () => {
  it("200 — returns a specific active service", async () => {
    const res = await request(app).get(`/api/services/${createdServiceId}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty("id", createdServiceId);
    expect(res.body.data.isActive).toBe(true);
  });

  it("404 — returns not found for unknown id", async () => {
    const res = await request(app).get(
      "/api/services/00000000-0000-0000-0000-000000000000",
    );

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PATCH /api/services/:id  (ADMIN only)
// ---------------------------------------------------------------------------
describe("PATCH /api/services/:id", () => {
  it("200 — ADMIN updates a service", async () => {
    const res = await request(app)
      .patch(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Updated Test Service" });

    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({
      name: "Updated Test Service",
    });
  });

  it("400 — rejects an empty name", async () => {
    const res = await request(app)
      .patch(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "" });

    expect(res.status).toBe(400);
  });

  it("403 — CLIENT cannot update a service", async () => {
    const res = await request(app)
      .patch(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ name: "Hijacked Name" });

    expect(res.status).toBe(403);
  });

  it("404 — not found for unknown id", async () => {
    const res = await request(app)
      .patch("/api/services/00000000-0000-0000-0000-000000000000")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Ghost Service" });

    expect(res.status).toBe(404);
  });
});

// ---------------------------------------------------------------------------
// DELETE /api/services/:id  (ADMIN only — soft delete)
// ---------------------------------------------------------------------------
describe("DELETE /api/services/:id", () => {
  it("200 — ADMIN soft-deletes a service (sets isActive = false)", async () => {
    const res = await request(app)
      .delete(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("404 — GET by id returns not found after soft delete", async () => {
    const res = await request(app).get(`/api/services/${createdServiceId}`);

    expect(res.status).toBe(404);
  });

  it("409 — deleting an already-deactivated service returns conflict", async () => {
    const res = await request(app)
      .delete(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
  });

  it("200 — ADMIN can reactivate a service via PATCH", async () => {
    const res = await request(app)
      .patch(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: true });

    expect(res.status).toBe(200);
    expect(res.body.data.isActive).toBe(true);
  });

  it("403 — CLIENT cannot delete a service", async () => {
    const res = await request(app)
      .delete(`/api/services/${createdServiceId}`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(403);
  });
});
