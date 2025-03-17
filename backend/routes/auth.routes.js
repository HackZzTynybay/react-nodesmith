
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const validate = require('../middleware/validate');
const authValidation = require('../validations/auth.validation');
const auth = require('../middleware/auth');

// Register new user and company
router.post(
  '/register',
  validate(authValidation.registerSchema),
  authController.register
);

// Login
router.post(
  '/login',
  validate(authValidation.loginSchema),
  authController.login
);

// Verify email
router.post(
  '/verify-email',
  validate(authValidation.verifyEmailSchema),
  authController.verifyEmail
);

// Resend verification email
router.post(
  '/resend-verification',
  auth,
  authController.resendVerification
);

// Update email
router.post(
  '/update-email',
  auth,
  validate(authValidation.updateEmailSchema),
  authController.updateEmail
);

// Create password
router.post(
  '/create-password',
  auth,
  validate(authValidation.createPasswordSchema),
  authController.createPassword
);

module.exports = router;
