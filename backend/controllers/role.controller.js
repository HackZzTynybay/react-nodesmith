
const Role = require('../models/role.model');
const Department = require('../models/department.model');
const { catchAsync, AppError } = require('../utils/errorHandler');

// Get all roles for the company
const getAllRoles = catchAsync(async (req, res) => {
  const roles = await Role.find({ company: req.user.company }).populate('department');
  
  res.status(200).json({
    success: true,
    count: roles.length,
    data: roles
  });
});

// Create role
const createRole = catchAsync(async (req, res) => {
  const { title, department, responsibilities } = req.body;
  
  // Check if department exists and belongs to the company
  const departmentExists = await Department.findOne({
    _id: department,
    company: req.user.company
  });
  
  if (!departmentExists) {
    throw new AppError('Department not found', 404);
  }
  
  const role = new Role({
    title,
    department,
    responsibilities,
    company: req.user.company
  });
  
  await role.save();
  
  res.status(201).json({
    success: true,
    message: 'Role created successfully',
    data: role
  });
});

// Get role by ID
const getRoleById = catchAsync(async (req, res) => {
  const role = await Role.findOne({
    _id: req.params.id,
    company: req.user.company
  }).populate('department');
  
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: role
  });
});

// Update role
const updateRole = catchAsync(async (req, res) => {
  const { title, department, responsibilities } = req.body;
  
  // Check if department exists and belongs to the company
  if (department) {
    const departmentExists = await Department.findOne({
      _id: department,
      company: req.user.company
    });
    
    if (!departmentExists) {
      throw new AppError('Department not found', 404);
    }
  }
  
  const role = await Role.findOneAndUpdate(
    { _id: req.params.id, company: req.user.company },
    { title, department, responsibilities },
    { new: true, runValidators: true }
  ).populate('department');
  
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Role updated successfully',
    data: role
  });
});

// Delete role
const deleteRole = catchAsync(async (req, res) => {
  const role = await Role.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company
  });
  
  if (!role) {
    throw new AppError('Role not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Role deleted successfully'
  });
});

// Get roles by department
const getRolesByDepartment = catchAsync(async (req, res) => {
  const { departmentId } = req.params;
  
  // Check if department exists and belongs to the company
  const departmentExists = await Department.findOne({
    _id: departmentId,
    company: req.user.company
  });
  
  if (!departmentExists) {
    throw new AppError('Department not found', 404);
  }
  
  const roles = await Role.find({
    department: departmentId,
    company: req.user.company
  });
  
  res.status(200).json({
    success: true,
    count: roles.length,
    data: roles
  });
});

module.exports = {
  getAllRoles,
  createRole,
  getRoleById,
  updateRole,
  deleteRole,
  getRolesByDepartment
};
