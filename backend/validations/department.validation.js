
const Joi = require('joi');

const departmentSchema = Joi.object({
  name: Joi.string().required().messages({
    'any.required': 'Department name is required'
  }),
  email: Joi.string().email().allow('').messages({
    'string.email': 'Please enter a valid email address'
  }),
  lead: Joi.string().allow('')
});

module.exports = {
  departmentSchema
};
