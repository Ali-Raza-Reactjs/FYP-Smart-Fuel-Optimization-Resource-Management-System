const request = require("supertest");
const mongoose = require("mongoose");

global.fetch = jest.fn(async () => ({
  ok: true,
  json: async () => ({
    code: "Ok",
    routes: [
      {
        distance: 12000,
        duration: 900,
        geometry: { type: "LineString", coordinates: [[73.04, 33.68], [73.06, 33.7]] },
      },
      {
        distance: 15000,
        duration: 800,
        geometry: { type: "LineString", coordinates: [[73.04, 33.68], [73.08, 33.72]] },
      },
    ],
  }),
}));

const app = require("../server");

const auth = (token) => ({ Authorization: `Bearer ${token}` });

describe("API endpoints", () => {
  let adminToken;
  let individualToken;
  let orgId;
  let vehicleId;
  let fuelId;
  let tripId;
  let budgetId;
  let notificationId;

  beforeAll(async () => {
    const started = Date.now();
    while (mongoose.connection.readyState !== 1 && Date.now() - started < 20000) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    if (mongoose.connection.readyState !== 1) {
      throw new Error("MongoDB is not connected. Start MongoDB and retry.");
    }
    await new Promise((resolve) => setTimeout(resolve, 800));
  });

  afterAll(async () => {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
  });

  test("POST /api/auth/register creates an Individual", async () => {
    const email = `user${Date.now()}@test.com`;
    const res = await request(app).post("/api/auth/register").send({
      name: "Test Individual",
      email,
      password: "Password1",
      contactNumber: "03001234567",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.role).toBe("Individual");
    expect(res.body.data.token).toBeTruthy();
    individualToken = res.body.data.token;
  });

  test("POST /api/auth/login authenticates admin", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "Admin@123",
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    adminToken = res.body.data.token;
  });

  test("GET /api/vehicles without token is unauthorized", async () => {
    const res = await request(app).get("/api/vehicles");
    expect([401, 403]).toContain(res.status);
  });

  test("GET /api/users/profile returns current user", async () => {
    const res = await request(app).get("/api/users/profile").set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(res.body.data.email).toBeTruthy();
  });

  test("GET /api/dashboard returns stats", async () => {
    const res = await request(app).get("/api/dashboard").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("POST /api/organizations creates an organization", async () => {
    const res = await request(app).post("/api/organizations").set(auth(adminToken)).send({
      name: `Org ${Date.now()}`,
      address: "Islamabad",
      contactEmail: `org${Date.now()}@test.com`,
      contactPhone: "0511111111",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    orgId = res.body.data._id;
  });

  test("GET /api/organizations lists organizations", async () => {
    const res = await request(app).get("/api/organizations").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test("PUT /api/organizations/:id/crisis toggles crisis mode", async () => {
    const res = await request(app).put(`/api/organizations/${orgId}/crisis`).set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    expect(typeof res.body.data.crisisMode).toBe("boolean");
  });

  test("POST /api/vehicles creates a vehicle", async () => {
    const res = await request(app).post("/api/vehicles").set(auth(individualToken)).send({
      vehicleName: "Civic",
      registrationNumber: `TST${Date.now()}`,
      manufacturer: "Honda",
      modelYear: 2020,
      fuelCapacity: 47,
      fuelEfficiency: 14,
      fuelType: "Petrol",
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    vehicleId = res.body.data._id;
  });

  test("GET /api/vehicles lists vehicles", async () => {
    const res = await request(app).get("/api/vehicles").set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("GET /api/vehicles/:id returns one vehicle", async () => {
    const res = await request(app).get(`/api/vehicles/${vehicleId}`).set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.data._id).toBe(vehicleId);
  });

  test("POST /api/fuel creates a fuel record", async () => {
    const res = await request(app).post("/api/fuel").set(auth(individualToken)).send({
      vehicle: vehicleId,
      date: new Date().toISOString(),
      liters: 20,
      cost: 5000,
      odometerReading: 12000,
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    fuelId = res.body.data._id;
  });

  test("GET /api/fuel/vehicle/:vehicleId lists fuel records", async () => {
    const res = await request(app).get(`/api/fuel/vehicle/${vehicleId}`).set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.data.records.length).toBeGreaterThan(0);
  });

  test("PUT /api/fuel/:id updates a fuel record", async () => {
    const res = await request(app).put(`/api/fuel/${fuelId}`).set(auth(individualToken)).send({
      liters: 22,
      cost: 5500,
    });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("POST /api/routes/optimize returns fuel estimate and routes", async () => {
    const res = await request(app).post("/api/routes/optimize").set(auth(individualToken)).send({
      startCoordinates: { lat: 33.68, lng: 73.04 },
      endCoordinates: { lat: 33.7, lng: 73.06 },
      vehicleId,
    });
    expect(res.status).toBe(200);
    expect(res.body.data.estimatedFuel).toBeGreaterThan(0);
    expect(Array.isArray(res.body.data.routes)).toBe(true);
  });

  test("POST /api/trips creates a trip", async () => {
    const res = await request(app).post("/api/trips").set(auth(individualToken)).send({
      vehicle: vehicleId,
      startLocation: "Islamabad",
      endLocation: "Rawalpindi",
      startCoordinates: { lat: 33.68, lng: 73.04 },
      endCoordinates: { lat: 33.6, lng: 73.05 },
      startTime: new Date().toISOString(),
      isEssential: true,
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    tripId = res.body.data._id;
  });

  test("GET /api/trips lists trips", async () => {
    const res = await request(app).get("/api/trips").set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("PUT /api/trips/:id updates trip status", async () => {
    const res = await request(app).put(`/api/trips/${tripId}`).set(auth(individualToken)).send({
      status: "Completed",
    });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("Completed");
  });

  test("POST /api/budgets creates an individual budget", async () => {
    const now = new Date();
    const res = await request(app).post("/api/budgets").set(auth(individualToken)).send({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalLimit: 20000,
      alertThreshold: 80,
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
  });

  test("POST /api/budgets creates an organization budget for admin", async () => {
    const now = new Date();
    const res = await request(app).post("/api/budgets").set(auth(adminToken)).send({
      organization: orgId,
      month: now.getMonth() + 1,
      year: now.getFullYear(),
      totalLimit: 100000,
      alertThreshold: 80,
    });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe(true);
    budgetId = res.body.data._id;
  });

  test("GET /api/budgets lists budgets", async () => {
    const res = await request(app).get("/api/budgets").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("GET /api/notifications lists notifications", async () => {
    const res = await request(app).get("/api/notifications").set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
    if (res.body.data.length > 0) {
      notificationId = res.body.data[0]._id;
    }
  });

  test("PUT /api/notifications/read-all marks all read", async () => {
    const res = await request(app).put("/api/notifications/read-all").set(auth(individualToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("GET /api/reports/export returns CSV for admin", async () => {
    const start = new Date();
    start.setDate(1);
    const res = await request(app)
      .get("/api/reports/export")
      .query({
        startDate: start.toISOString().slice(0, 10),
        endDate: new Date().toISOString().slice(0, 10),
      })
      .set(auth(adminToken));
    expect(res.status).toBe(200);
  });

  test("GET /api/users lists users for admin", async () => {
    const res = await request(app).get("/api/users").set(auth(adminToken));
    expect(res.status).toBe(200);
    expect(res.body.status).toBe(true);
  });

  test("POST /api/auth/logout succeeds", async () => {
    const res = await request(app).post("/api/auth/logout").set(auth(individualToken));
    expect(res.status).toBe(200);
  });

  test("DELETE /api/fuel/:id deletes fuel record", async () => {
    const res = await request(app).delete(`/api/fuel/${fuelId}`).set(auth(individualToken));
    expect(res.status).toBe(200);
  });

  test("DELETE /api/trips/:id deletes trip", async () => {
    const res = await request(app).delete(`/api/trips/${tripId}`).set(auth(individualToken));
    expect(res.status).toBe(200);
  });

  test("DELETE /api/budgets/:id deletes org budget", async () => {
    const res = await request(app).delete(`/api/budgets/${budgetId}`).set(auth(adminToken));
    expect(res.status).toBe(200);
  });

  test("DELETE /api/vehicles/:id deletes vehicle", async () => {
    const res = await request(app).delete(`/api/vehicles/${vehicleId}`).set(auth(individualToken));
    expect(res.status).toBe(200);
  });
});
