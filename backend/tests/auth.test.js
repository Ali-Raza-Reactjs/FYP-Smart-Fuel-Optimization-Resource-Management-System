const request = require('supertest');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const express = require('express');
const authRoutes = require('../src/routes/auth.routes');
const errorMiddleware = require('../src/middlewares/error.middleware');
const User = require('../src/models/User');

// Setup express app for testing without starting the full server
dotenv.config();
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use(errorMiddleware);

describe('Authentication API Tests', () => {
  beforeAll(async () => {
    // Connect to a test database
    await mongoose.connect(process.env.MONGO_URI);
    // Clear users before testing
    await User.deleteMany({});
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  const testUser = {
    name: 'Test Manager',
    email: 'testmanager@fyp.com',
    password: 'password123',
    role: 'Manager'
  };

  describe('POST /api/auth/register', () => {
    it('should register a new user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      if (res.statusCode !== 201) console.error(res.body);

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toEqual(testUser.email);
    });

    it('should prevent duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login the user and return a token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toEqual(testUser.email);
    });

    it('should reject invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message');
    });
  });
});
