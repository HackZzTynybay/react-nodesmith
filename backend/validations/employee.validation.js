
const Joi = require('joi');

const employeeSchema = Joi.object({
  firstName: Joi.string().required().messages({
    'any.required': 'First name is required'
  }),
  lastName: Joi.string().required().messages({
    'any.required': 'Last name is required'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Please enter a valid email address',
    'any.required': 'Email is required'
  }),
  phone: Joi.string().allow(''),
  department: Joi.string().required().messages({
    'any.required': 'Department is required'
  }),
  role: Joi.string().required().messages({
    'any.required': 'Role is required'
  }),
  startDate: Joi.date().required().messages({
    'any.required': 'Start date is required'
  })
});

module.exports = {
  employeeSchema
};
