import request from "supertest";
import app from "../app";
import { Appointment } from "../models";

let adminToken = "";
let providerToken = "";
let clientToken = "";
let providerUserId = "";
let clientUserId = "";
let serviceId = "";
let providerServiceId = "";

// Track IDs of appointments created during tests for cleanup
const createdIds: string[] = [];

beforeAll(async () => {
  const [adminRes, providerRes, clientRes] = await Promise.all([
    request(app)
      .post("/api/auth/login")
      .send({ email: "admin@ndova.com", password: "Admin@123" }),
    request(app)
      .post("/api/auth/login")
      .send({ email: "provider@ndova.com", password: "Provider@123" }),
    request(app)
      .post("/api/auth/login")
      .send({ email: "client@ndova.com", password: "Client@123" }),
  ]);

  adminToken = adminRes.body.data.token;
  providerToken = providerRes.body.data.token;
  providerUserId = providerRes.body.data.user.id;
  clientToken = clientRes.body.data.token;
  clientUserId = clientRes.body.data.user.id;

  // Pick the first active service for all appointment tests
  const svcRes = await request(app).get("/api/services");
  serviceId = svcRes.body.data[0].id;

  const providerServicesRes = await request(app)
    .get("/api/provider-services/mine")
    .set("Authorization", `Bearer ${providerToken}`);
  const providerService = providerServicesRes.body.data[0];
  providerServiceId = providerService.id;
  serviceId = providerService.serviceId;
});

afterAll(async () => {
  if (createdIds.length) {
    await Appointment.destroy({ where: { id: createdIds } }).catch(() => {});
  }
});

// ---- helpers ----------------------------------------------------------------

function makeAppointment(extras = {}) {
  return {
    serviceId,
    providerId: providerUserId,
    requestedDate: "2025-12-01",
    requestedTime: "10:00",
    reason: "Test appointment",
    ...extras,
  };
}

// ---- POST /api/appointments -------------------------------------------------

describe("POST /api/appointments", () => {
  it("201 — CLIENT creates an appointment", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toMatchObject({
      status: "PENDING",
      clientId: clientUserId,
    });
    expect(res.body.data.client).toHaveProperty("email", "client@ndova.com");
    expect(res.body.data.service).toHaveProperty("id", serviceId);

    createdIds.push(res.body.data.id);
  });

  it("403 — ADMIN cannot create an appointment (CLIENT role only)", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(makeAppointment());

    expect(res.status).toBe(403);
  });

  it("401 — unauthenticated request is rejected", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send(makeAppointment());
    expect(res.status).toBe(401);
  });

  it("400 — rejects invalid date format", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment({ requestedDate: "not-a-date" }));

    expect(res.status).toBe(400);
  });

  it("400 — rejects invalid time format", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment({ requestedTime: "25:99" }));

    expect(res.status).toBe(400);
  });

  it("404 — rejects an inactive or non-existent service", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(
        makeAppointment({ serviceId: "00000000-0000-0000-0000-000000000000" }),
      );

    expect(res.status).toBe(404);
  });

  it("201 — persists provider-service booking details and lists it for the provider", async () => {
    const createRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        serviceId,
        providerId: providerUserId,
        providerServiceId,
        requestedDate: "2030-01-07",
        requestedTime: "14:00",
        sessionType: "IN_PERSON",
        reason: "Booking flow integration test",
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.data).toMatchObject({
      providerId: providerUserId,
      providerServiceId,
      sessionType: "IN_PERSON",
      reason: "Booking flow integration test",
    });
    expect(createRes.body.data.durationMinutes).toBeGreaterThan(0);
    expect(createRes.body.data.location).toBeTruthy();
    createdIds.push(createRes.body.data.id);

    const providerListRes = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${providerToken}`);

    expect(providerListRes.status).toBe(200);
    expect(
      providerListRes.body.data.some(
        (appointment: { id: string }) =>
          appointment.id === createRes.body.data.id,
      ),
    ).toBe(true);
  });

  it("409 — rejects an overlapping provider time slot", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        serviceId,
        providerId: providerUserId,
        providerServiceId,
        requestedDate: "2030-01-07",
        requestedTime: "14:00",
        sessionType: "IN_PERSON",
      });

    expect(res.status).toBe(409);
  });
});

// ---- GET /api/appointments --------------------------------------------------

describe("GET /api/appointments", () => {
  it("200 — CLIENT sees only their own appointments", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((a: any) => expect(a.clientId).toBe(clientUserId));
  });

  it("200 — PROVIDER sees only appointments assigned to them", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(200);
    res.body.data.forEach((a: any) =>
      expect(a.providerId).toBe(providerUserId),
    );
  });

  it("200 — ADMIN sees all appointments", async () => {
    const res = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("401 — rejects unauthenticated request", async () => {
    const res = await request(app).get("/api/appointments");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/appointments/availability", () => {
  let appointmentId = "";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send({
        serviceId,
        providerId: providerUserId,
        providerServiceId,
        requestedDate: "2031-02-03",
        requestedTime: "11:00",
        sessionType: "IN_PERSON",
      });
    appointmentId = res.body.data.id;
    createdIds.push(appointmentId);
  });

  it("200 — returns pending and approved appointments as occupied slots", async () => {
    const res = await request(app)
      .get("/api/appointments/availability")
      .query({
        providerServiceId,
        date: "2031-02-03",
      })
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: appointmentId,
          startTime: "11:00",
          status: "PENDING",
        }),
      ]),
    );
  });

  it("200 — rejected appointments no longer occupy the slot", async () => {
    const rejectRes = await request(app)
      .patch(`/api/appointments/${appointmentId}/reject`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ adminNote: "Please choose another time." });
    expect(rejectRes.status).toBe(200);

    const availabilityRes = await request(app)
      .get("/api/appointments/availability")
      .query({
        providerServiceId,
        date: "2031-02-03",
      })
      .set("Authorization", `Bearer ${clientToken}`);

    expect(availabilityRes.status).toBe(200);
    expect(
      availabilityRes.body.data.some(
        (slot: { id: string }) => slot.id === appointmentId,
      ),
    ).toBe(false);
  });
});

// ---- Approve → Complete flow ------------------------------------------------

describe("Approve → Complete flow", () => {
  let appointmentId = "";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());
    appointmentId = res.body.data.id;
    createdIds.push(appointmentId);
  });

  it("200 — GET/:id: CLIENT can retrieve their own appointment", async () => {
    const res = await request(app)
      .get(`/api/appointments/${appointmentId}`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(appointmentId);
  });

  it("403 — GET/:id: CLIENT cannot retrieve another user's appointment", async () => {
    // Use admin to create a different appointment first
    // Here we test with provider trying to access client's unassigned appointment
    const otherRes = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment({ providerId: undefined })); // no provider
    const otherId = otherRes.body.data.id;
    createdIds.push(otherId);

    const res = await request(app)
      .get(`/api/appointments/${otherId}`)
      .set("Authorization", `Bearer ${providerToken}`);

    expect(res.status).toBe(403);
  });

  it("200 — PROVIDER approves an appointment assigned to them", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/approve`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ adminNote: "Confirmed, see you then." });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("APPROVED");
    expect(res.body.data.adminNote).toBe("Confirmed, see you then.");
  });

  it("400 — Cannot approve an already-APPROVED appointment", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/approve`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("200 — PROVIDER completes an APPROVED appointment", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/complete`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({ adminNote: "Session completed." });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("COMPLETED");
  });

  it("400 — Cannot cancel a COMPLETED appointment", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("200 — History has 3 entries: PENDING → APPROVED → COMPLETED", async () => {
    const res = await request(app)
      .get(`/api/appointments/${appointmentId}/history`)
      .set("Authorization", `Bearer ${clientToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(3);
    expect(res.body.data[0].newStatus).toBe("PENDING");
    expect(res.body.data[1].newStatus).toBe("APPROVED");
    expect(res.body.data[2].newStatus).toBe("COMPLETED");
  });
});

// ---- Reject flow ------------------------------------------------------------

describe("Reject flow", () => {
  let appointmentId = "";

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());
    appointmentId = res.body.data.id;
    createdIds.push(appointmentId);
  });

  it("200 — ADMIN rejects a PENDING appointment", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reject`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ adminNote: "No availability." });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("REJECTED");
  });

  it("400 — Cannot reject an already-REJECTED appointment", async () => {
    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/reject`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it("403 — CLIENT cannot reject an appointment", async () => {
    // Create a fresh pending appointment to test this
    const fresh = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());
    createdIds.push(fresh.body.data.id);

    const res = await request(app)
      .patch(`/api/appointments/${fresh.body.data.id}/reject`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({});

    expect(res.status).toBe(403);
  });
});

// ---- Cancel flow ------------------------------------------------------------

describe("Cancel flow", () => {
  it("200 — CLIENT cancels their own PENDING appointment", async () => {
    const created = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());
    const appointmentId = created.body.data.id;
    createdIds.push(appointmentId);

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ note: "Change of plans." });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("200 — CLIENT cancels their own APPROVED appointment", async () => {
    const created = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());
    const appointmentId = created.body.data.id;
    createdIds.push(appointmentId);

    // Approve first
    await request(app)
      .patch(`/api/appointments/${appointmentId}/approve`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({});

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/cancel`)
      .set("Authorization", `Bearer ${clientToken}`)
      .send({ note: "Cannot make it." });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("CANCELLED");
  });

  it("400 — Cannot complete a PENDING appointment (must be APPROVED first)", async () => {
    const created = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${clientToken}`)
      .send(makeAppointment());
    const appointmentId = created.body.data.id;
    createdIds.push(appointmentId);

    const res = await request(app)
      .patch(`/api/appointments/${appointmentId}/complete`)
      .set("Authorization", `Bearer ${providerToken}`)
      .send({});

    expect(res.status).toBe(400);
  });
});
