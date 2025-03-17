
const Joi = require('joi');

const roleSchema = Joi.object({
  title: Joi.string().required().messages({
    'any.required': 'Role title is required'
  }),
  department: Joi.string().required().messages({
    'any.required': 'Department is required'
  }),
  responsibilities: Joi.string().allow('')
});

module.exports = {
  roleSchema
};
