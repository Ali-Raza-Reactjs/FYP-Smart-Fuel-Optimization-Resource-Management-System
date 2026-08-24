const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const authRoutes = require('../src/routes/auth.routes');
const userRoutes = require('../src/routes/user.routes');
const errorMiddleware = require('../src/middlewares/error.middleware');
const User = require('../src/models/User');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use(errorMiddleware);

describe('User Management and Profile API Tests', () => {
  let adminToken;
  let individualToken;
  let adminId;
  let individualId;
  let tempUserId;

  const adminUser = {
    name: 'Admin User',
    email: 'admin@fyp.com',
    password: 'adminpassword123',
    role: 'Admin',
    contactNumber: '1122334455'
  };

  const individualUser = {
    name: 'Individual User',
    email: 'individual@fyp.com',
    password: 'indivpassword123',
    role: 'Individual',
    contactNumber: '5566778899'
  };

  const tempUser = {
    name: 'Temp Inactive User',
    email: 'temp@fyp.com',
    password: 'temppassword123',
    role: 'Individual',
    contactNumber: '9999999999'
  };

  beforeAll(async () => {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    // Clean users collection
    await User.deleteMany({});

    // Register admin user
    const adminRes = await request(app)
      .post('/api/auth/register')
      .send(adminUser);
    adminToken = adminRes.body.token;
    adminId = adminRes.body._id;

    // Register individual user
    const indivRes = await request(app)
      .post('/api/auth/register')
      .send(individualUser);
    individualToken = indivRes.body.token;
    individualId = indivRes.body._id;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('User Logout API', () => {
    it('should successfully log out an authenticated user', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${individualToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Logged out');
    });

    it('should reject logout without authentication', async () => {
      const res = await request(app)
        .post('/api/auth/logout');

      expect(res.statusCode).toEqual(401);
    });
  });

  describe('Profile Management', () => {
    it('should retrieve authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${individualToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.email).toEqual(individualUser.email.toLowerCase());
      expect(res.body.role).toEqual('Individual');
    });

    it('should update authenticated user profile details', async () => {
      const res = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${individualToken}`)
        .send({
          name: 'Updated Indiv Name',
          phoneNumber: '0000000000',
          address: '123 New Street'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Updated Indiv Name');
      expect(res.body.profile.phoneNumber).toEqual('0000000000');
      expect(res.body.profile.address).toEqual('123 New Street');
    });
  });

  describe('Admin User Management (Task 4)', () => {
    beforeAll(async () => {
      // Register a temporary user that we will set to inactive and delete
      const res = await request(app)
        .post('/api/auth/register')
        .send(tempUser);
      tempUserId = res.body._id;

      // Manually update status to Inactive in the database for deletion test
      await User.findByIdAndUpdate(tempUserId, { status: 'Inactive' });
    });

    it('should allow Admin to view all registered users', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThanOrEqual(3);
    });

    it('should prevent Individual user from viewing all registered users (RBAC check)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${individualToken}`);

      expect(res.statusCode).toEqual(403);
    });

    it('should allow Admin to view a specific user details', async () => {
      const res = await request(app)
        .get(`/api/users/${individualId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body._id).toEqual(individualId);
    });

    it('should allow Admin to update user information', async () => {
      const res = await request(app)
        .put(`/api/users/${individualId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Admin Managed Name',
          role: 'Individual',
          status: 'Active'
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body.name).toEqual('Admin Managed Name');
    });

    it('should allow Admin to delete all inactive users', async () => {
      const res = await request(app)
        .delete('/api/users/inactive')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('deleted');

      // Check that the temp user is indeed deleted
      const checkUser = await User.findById(tempUserId);
      expect(checkUser).toBeNull();
    });

    it('should allow Admin to delete a specific user', async () => {
      // Register another temp user to delete individually
      const tempUserRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User to Delete',
          email: 'delete-me@fyp.com',
          password: 'password123',
          role: 'Individual'
        });
      const toDeleteId = tempUserRes.body._id;

      const res = await request(app)
        .delete(`/api/users/${toDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);

      const checkUser = await User.findById(toDeleteId);
      expect(checkUser).toBeNull();
    });
  });
});
