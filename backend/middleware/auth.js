
const jwt = require('jsonwebtoken');
const { AppError } = require('../utils/errorHandler');
const User = require('../models/user.model');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return next(new AppError('Authentication required', 401));
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return next(new AppError('User not found', 401));
    }
    
    req.user = user;
    next();
  } catch (error) {
    next(new AppError('Invalid token', 401));
  }
};

module.exports = auth;
