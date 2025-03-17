
const Department = require('../models/department.model');
const { catchAsync, AppError } = require('../utils/errorHandler');

// Get all departments for the company
const getAllDepartments = catchAsync(async (req, res) => {
  const departments = await Department.find({ company: req.user.company });
  
  res.status(200).json({
    success: true,
    count: departments.length,
    data: departments
  });
});

// Create department
const createDepartment = catchAsync(async (req, res) => {
  const { name, email, lead } = req.body;
  
  const department = new Department({
    name,
    email,
    lead,
    company: req.user.company
  });
  
  await department.save();
  
  res.status(201).json({
    success: true,
    message: 'Department created successfully',
    data: department
  });
});

// Get department by ID
const getDepartmentById = catchAsync(async (req, res) => {
  const department = await Department.findOne({
    _id: req.params.id,
    company: req.user.company
  });
  
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: department
  });
});

// Update department
const updateDepartment = catchAsync(async (req, res) => {
  const { name, email, lead } = req.body;
  
  const department = await Department.findOneAndUpdate(
    { _id: req.params.id, company: req.user.company },
    { name, email, lead },
    { new: true, runValidators: true }
  );
  
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Department updated successfully',
    data: department
  });
});

// Delete department
const deleteDepartment = catchAsync(async (req, res) => {
  const department = await Department.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company
  });
  
  if (!department) {
    throw new AppError('Department not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Department deleted successfully'
  });
});

module.exports = {
  getAllDepartments,
  createDepartment,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
};
