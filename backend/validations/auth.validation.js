
const Joi = require('joi');

const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  fullName: Joi.string().required().messages({
    'any.required': 'Full name is required'
  }),
  companyName: Joi.string().required().messages({
    'any.required': 'Company name is required'
  }),
  phone: Joi.string().allow(''),
  companyId: Joi.string().allow(''),
  employeeCount: Joi.string().allow('')
});

const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Verification token is required'
  })
});

const updateEmailSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  })
});

const createPasswordSchema = Joi.object({
  password: Joi.string()
    .min(8).message('Password must be at least 8 characters long')
    .regex(/[A-Z]/).message('Password must include at least one uppercase letter')
    .regex(/[0-9]/).message('Password must include at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/).message('Password must include at least one special character')
    .required().messages({
      'any.required': 'Password is required'
    })
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  updateEmailSchema,
  createPasswordSchema
};
