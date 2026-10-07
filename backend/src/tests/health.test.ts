import request from "supertest";
import app from "../app";

describe("GET /api/health", () => {
  it("returns 200 with success status", async () => {
    const res = await request(app).get("/api/health");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("Server is healthy");
    expect(res.body.data).toHaveProperty("status", "ok");
    expect(res.body.data).toHaveProperty("timestamp");
    expect(res.body.data).toHaveProperty("environment");
  });

  it("returns 404 for unknown routes", async () => {
    const res = await request(app).get("/api/unknown-route");

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/not found/i);
  });
});
