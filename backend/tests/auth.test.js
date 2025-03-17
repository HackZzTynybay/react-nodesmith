
const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../server');
const User = require('../models/user.model');
const Company = require('../models/company.model');

describe('Auth Controller Tests', () => {
  beforeAll(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/easyhr-test');
    
    // Clear the database before tests
    await User.deleteMany({});
    await Company.deleteMany({});
  });

  afterAll(async () => {
    // Disconnect after tests
    await mongoose.disconnect();
  });

  describe('Register Endpoint', () => {
    it('should register a new user and company successfully', async () => {
      const userData = {
        email: 'test@example.com',
        fullName: 'Test User',
        companyName: 'Test Company',
        phone: '1234567890',
        companyId: 'TC123',
        employeeCount: '1-10',
        jobTitle: 'Manager',
        termsAccepted: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.company.name).toBe(userData.companyName);
    });

    it('should return 400 if email is already registered', async () => {
      const userData = {
        email: 'test@example.com', // Same email as previous test
        fullName: 'Another User',
        companyName: 'Another Company',
        phone: '9876543210',
        companyId: 'AC123',
        employeeCount: '11-50',
        jobTitle: 'CEO',
        termsAccepted: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toContain('already registered');
    });

    it('should validate required fields', async () => {
      const userData = {
        // Missing required fields
        email: 'incomplete@example.com',
        termsAccepted: true
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBeFalsy();
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Login Endpoint', () => {
    let verificationToken;

    beforeAll(async () => {
      // Create a verified user for login tests
      const company = new Company({
        name: 'Login Test Company',
        email: 'logintest@example.com',
      });
      await company.save();

      const user = new User({
        email: 'logintest@example.com',
        fullName: 'Login Test',
        role: 'admin',
        company: company._id,
        isEmailVerified: true,
        password: 'Password123!'
      });

      await user.save();

      // Create an unverified user
      const unverifiedUser = new User({
        email: 'unverified@example.com',
        fullName: 'Unverified User',
        role: 'admin',
        company: company._id,
        isEmailVerified: false,
        password: 'Password123!'
      });

      verificationToken = unverifiedUser.generateVerificationToken();
      await unverifiedUser.save();
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('logintest@example.com');
    });

    it('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBeFalsy();
    });

    it('should return 401 for unverified email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'unverified@example.com',
          password: 'Password123!'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toContain('verify your email');
    });

    it('should verify email with valid token', async () => {
      const response = await request(app)
        .post('/api/auth/verify-email')
        .send({
          token: verificationToken
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data.isEmailVerified).toBeTruthy();

      // Verify that the user is now marked as verified in the database
      const user = await User.findOne({ email: 'unverified@example.com' });
      expect(user.isEmailVerified).toBeTruthy();
    });
  });

  describe('Password Management', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get auth token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'Password123!'
        });

      authToken = response.body.data.token;
    });

    it('should create a new password', async () => {
      const response = await request(app)
        .post('/api/auth/create-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'NewPassword123!'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
    });

    it('should validate password requirements', async () => {
      const response = await request(app)
        .post('/api/auth/create-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          password: 'weak'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBeFalsy();
    });
  });

  describe('Email Management', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get auth token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'logintest@example.com',
          password: 'NewPassword123!' // Updated password from previous test
        });

      authToken = response.body.data.token;
    });

    it('should update email address', async () => {
      const response = await request(app)
        .post('/api/auth/update-email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'updated-email@example.com'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
      expect(response.body.data.email).toBe('updated-email@example.com');
      expect(response.body.data.isEmailVerified).toBeFalsy();
    });

    it('should not allow updating to an existing email', async () => {
      // Try to update to the email of another user
      const response = await request(app)
        .post('/api/auth/update-email')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          email: 'unverified@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBeFalsy();
      expect(response.body.message).toContain('already in use');
    });

    it('should resend verification email', async () => {
      const response = await request(app)
        .post('/api/auth/resend-verification')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBeTruthy();
    });
  });
});
