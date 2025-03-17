
const { AppError } = require('../utils/errorHandler');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      
      return next(new AppError('Validation failed', 400, errors));
    }
    
    next();
  };
};

module.exports = validate;
