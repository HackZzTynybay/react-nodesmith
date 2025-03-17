const User = require('../models/user.model');
const Company = require('../models/company.model');
const { catchAsync, AppError } = require('../utils/errorHandler');
const emailService = require('../services/email.service');

// Register user and company
const register = catchAsync(async (req, res) => {
  console.log('Registration request received:', req.body);
  
  const { email, fullName, companyName, phone, companyId, employeeCount, jobTitle } = req.body;
  
  // Validate required fields
  if (!email || !fullName || !companyName) {
    throw new AppError('Missing required fields', 400);
  }
  
  // Check if email is already registered
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email is already registered', 400);
  }
  
  // Create company
  const company = new Company({
    name: companyName,
    email,
    phone: phone || '',
    companyId: companyId || '',
    employeeCount: employeeCount || ''
  });
  
  await company.save();
  console.log('Company created:', company._id);
  
  // Create user
  const user = new User({
    email,
    fullName,
    jobTitle: jobTitle || '',
    role: 'admin',
    company: company._id
  });
  
  // Generate verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();
  console.log('User created:', user._id);
  
  // Send verification email
  try {
    const emailResult = await emailService.sendVerificationEmail(user, verificationToken);
    console.log('Verification email sent:', emailResult.messageId);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        company: {
          id: company._id,
          name: company.name,
          email: company.email
        },
        emailPreview: process.env.NODE_ENV === 'development' ? emailResult.previewUrl : undefined
      }
    });
  } catch (emailError) {
    console.error('Failed to send verification email:', emailError);
    
    // Return success but with a warning about email
    res.status(201).json({
      success: true,
      message: 'Registration successful but we could not send the verification email. Please try resending it later.',
      data: {
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isEmailVerified: user.isEmailVerified
        },
        company: {
          id: company._id,
          name: company.name,
          email: company.email
        }
      }
    });
  }
});

// Login
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  
  // Check if user exists
  const user = await User.findOne({ email }).populate('company');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Check if user has verified email
  if (!user.isEmailVerified) {
    throw new AppError('Please verify your email before logging in', 401);
  }
  
  // Check if user has set a password
  if (!user.password) {
    throw new AppError('Please set a password using the link sent to your email', 401);
  }
  
  // Check if password is correct
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }
  
  // Generate authentication token
  const token = user.generateAuthToken();
  
  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isEmailVerified: user.isEmailVerified
      },
      company: {
        id: user.company._id,
        name: user.company.name,
        email: user.company.email,
        isOnboardingComplete: user.company.isOnboardingComplete
      }
    }
  });
});

// Verify email
const verifyEmail = catchAsync(async (req, res) => {
  const { token } = req.body;
  
  // Find user with the token
  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() }
  });
  
  if (!user) {
    throw new AppError('Invalid or expired verification token', 400);
  }
  
  // Update user
  user.isEmailVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Email verification successful',
    data: {
      isEmailVerified: true
    }
  });
});

// Resend verification email
const resendVerification = catchAsync(async (req, res) => {
  const user = req.user;
  
  if (user.isEmailVerified) {
    throw new AppError('Email is already verified', 400);
  }
  
  // Generate new verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();
  
  // Send verification email
  const emailResult = await emailService.sendVerificationEmail(user, verificationToken);
  
  res.status(200).json({
    success: true,
    message: 'Verification email has been resent',
    data: {
      emailPreview: process.env.NODE_ENV === 'development' ? emailResult.previewUrl : undefined
    }
  });
});

// Update email
const updateEmail = catchAsync(async (req, res) => {
  const { email } = req.body;
  const user = req.user;
  
  // Check if the new email is already in use
  const existingUser = await User.findOne({ email, _id: { $ne: user._id } });
  if (existingUser) {
    throw new AppError('Email is already in use', 400);
  }
  
  // Update user's email
  user.email = email;
  user.isEmailVerified = false;
  
  // Generate new verification token
  const verificationToken = user.generateVerificationToken();
  await user.save();
  
  // Send verification email
  const emailResult = await emailService.sendVerificationEmail(user, verificationToken);
  
  res.status(200).json({
    success: true,
    message: 'Email updated successfully. Please verify your new email.',
    data: {
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      emailPreview: process.env.NODE_ENV === 'development' ? emailResult.previewUrl : undefined
    }
  });
});

// Create password
const createPassword = catchAsync(async (req, res) => {
  const { password } = req.body;
  const user = req.user;
  
  // Update user's password
  user.password = password;
  await user.save();
  
  res.status(200).json({
    success: true,
    message: 'Password created successfully'
  });
});

module.exports = {
  register,
  login,
  verifyEmail,
  resendVerification,
  updateEmail,
  createPassword
};
