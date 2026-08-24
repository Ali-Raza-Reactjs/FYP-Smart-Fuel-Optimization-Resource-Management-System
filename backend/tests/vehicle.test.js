const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const authRoutes = require('../src/routes/auth.routes');
const vehicleRoutes = require('../src/routes/vehicle.routes');
const errorMiddleware = require('../src/middlewares/error.middleware');
const User = require('../src/models/User');
const Vehicle = require('../src/models/Vehicle');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use(errorMiddleware);

describe('Vehicle CRUD and Authorization API Tests', () => {
  let adminToken;
  let individual1Token;
  let individual2Token;
  let driverToken;

  let adminId;
  let indiv1Id;
  let indiv2Id;
  let driverId;

  let vehicle1Id;
  let vehicle2Id;

  const adminUser = {
    name: 'Admin User V',
    email: 'adminv@fyp.com',
    password: 'adminpassword123',
    role: 'Admin',
    contactNumber: '1234567890'
  };

  const indivUser1 = {
    name: 'Indiv User One',
    email: 'indiv1@fyp.com',
    password: 'indivpassword123',
    role: 'Individual',
    contactNumber: '0987654321'
  };

  const indivUser2 = {
    name: 'Indiv User Two',
    email: 'indiv2@fyp.com',
    password: 'indivpassword123',
    role: 'Individual',
    contactNumber: '5432109876'
  };

  const driverUser = {
    name: 'Driver User',
    email: 'driver@fyp.com',
    password: 'driverpassword123',
    role: 'Driver',
    contactNumber: '1112223333'
  };

  beforeAll(async () => {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clean collections
    await User.deleteMany({});
    await Vehicle.deleteMany({});

    // Register all roles
    const adminRes = await request(app).post('/api/auth/register').send(adminUser);
    adminToken = adminRes.body.token;
    adminId = adminRes.body._id;

    const indiv1Res = await request(app).post('/api/auth/register').send(indivUser1);
    individual1Token = indiv1Res.body.token;
    indiv1Id = indiv1Res.body._id;

    const indiv2Res = await request(app).post('/api/auth/register').send(indivUser2);
    individual2Token = indiv2Res.body.token;
    indiv2Id = indiv2Res.body._id;

    const driverRes = await request(app).post('/api/auth/register').send(driverUser);
    driverToken = driverRes.body.token;
    driverId = driverRes.body._id;
  });

  afterAll(async () => {
    await Vehicle.deleteMany({});
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/vehicles (Create Vehicle)', () => {
    it('should allow Individual user to register a vehicle (Task 2)', async () => {
      const newVehicle = {
        vehicleName: 'Civic',
        registrationNumber: 'LHR-9999',
        manufacturer: 'Honda',
        modelYear: 2022,
        fuelCapacity: 50,
        fuelEfficiency: 12,
        fuelType: 'Petrol'
      };

      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${individual1Token}`)
        .send(newVehicle);

      expect(res.statusCode).toEqual(201);
      expect(res.body.vehicleName).toEqual('Civic');
      expect(res.body.registrationNumber).toEqual('LHR-9999');
      expect(res.body.owner).toEqual(indiv1Id);
      
      vehicle1Id = res.body._id;
    });

    it('should allow Admin to register any vehicle', async () => {
      const adminVehicle = {
        vehicleName: 'Prius',
        registrationNumber: 'ISB-8888',
        manufacturer: 'Toyota',
        modelYear: 2020,
        fuelCapacity: 45,
        fuelEfficiency: 20,
        fuelType: 'Electric',
        owner: indiv2Id
      };

      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(adminVehicle);

      expect(res.statusCode).toEqual(201);
      expect(res.body.vehicleName).toEqual('Prius');
      expect(res.body.owner).toEqual(indiv2Id);
      
      vehicle2Id = res.body._id;
    });

    it('should reject vehicle creation for unauthorized roles (e.g. Drivers)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${driverToken}`)
        .send({
          vehicleName: 'Mehran',
          registrationNumber: 'KHI-1111',
          manufacturer: 'Suzuki',
          modelYear: 2010,
          fuelCapacity: 30,
          fuelEfficiency: 15,
          fuelType: 'Petrol'
        });

      expect(res.statusCode).toEqual(403);
    });
  });

  describe('GET /api/vehicles (Read Vehicles)', () => {
    it('should restrict Individual user to only retrieve their own vehicles (RBAC check)', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${individual1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0]._id).toEqual(vehicle1Id);
    });

    it('should allow Admin to retrieve all vehicles', async () => {
      const res = await request(app)
        .get('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(2);
    });
  });

  describe('GET /api/vehicles/:id (Read Single Vehicle)', () => {
    it('should allow owner to retrieve their own vehicle details', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${individual1Token}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(vehicle1Id);
    });

    it('should prevent other individual users from retrieving the vehicle details', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${individual2Token}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin to retrieve any vehicle details', async () => {
      const res = await request(app)
        .get(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(vehicle1Id);
    });
  });

  describe('PUT /api/vehicles/:id (Update Vehicle)', () => {
    it('should allow owner to update their vehicle records', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${individual1Token}`)
        .send({
          vehicleName: 'Civic Turbo',
          fuelEfficiency: 14
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.vehicleName).toEqual('Civic Turbo');
      expect(res.body.fuelEfficiency).toEqual(14);
    });

    it('should prevent individual user from updating another user\'s vehicle (RBAC check)', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${individual2Token}`)
        .send({
          vehicleName: 'Hacked name'
        });

      expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin to update any vehicle details (Task 4)', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Maintenance'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.status).toEqual('Maintenance');
    });
  });

  describe('Admin Search and Delete (Task 4)', () => {
    it('should allow Admin to search vehicles by registration number', async () => {
      const res = await request(app)
        .get('/api/vehicles?search=LHR-9999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0]._id).toEqual(vehicle1Id);
    });

    it('should allow Admin to search vehicles by owner email', async () => {
      const res = await request(app)
        .get('/api/vehicles?search=indiv2@fyp.com')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toEqual(1);
      expect(res.body[0]._id).toEqual(vehicle2Id);
    });

    it('should allow owner to delete their own vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicle1Id}`)
        .set('Authorization', `Bearer ${individual1Token}`);

      expect(res.statusCode).toEqual(200);

      // Verify it's deleted
      const check = await Vehicle.findById(vehicle1Id);
      expect(check).toBeNull();
    });

    it('should allow Admin to delete any invalid/remaining vehicle records', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${vehicle2Id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);

      // Verify it's deleted
      const check = await Vehicle.findById(vehicle2Id);
      expect(check).toBeNull();
    });
  });
});
