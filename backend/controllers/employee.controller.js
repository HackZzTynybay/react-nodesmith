
const Employee = require('../models/employee.model');
const Department = require('../models/department.model');
const Role = require('../models/role.model');
const { catchAsync, AppError } = require('../utils/errorHandler');

// Get all employees for the company
const getAllEmployees = catchAsync(async (req, res) => {
  const employees = await Employee.find({ company: req.user.company })
    .populate('department')
    .populate('role');
  
  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// Create employee
const createEmployee = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, department, role, startDate } = req.body;
  
  // Check if department exists and belongs to the company
  const departmentExists = await Department.findOne({
    _id: department,
    company: req.user.company
  });
  
  if (!departmentExists) {
    throw new AppError('Department not found', 404);
  }
  
  // Check if role exists and belongs to the company
  const roleExists = await Role.findOne({
    _id: role,
    company: req.user.company
  });
  
  if (!roleExists) {
    throw new AppError('Role not found', 404);
  }
  
  // Check if the role belongs to the department
  if (roleExists.department.toString() !== department) {
    throw new AppError('Role does not belong to the selected department', 400);
  }
  
  // Check if email is already used by another employee
  const existingEmployee = await Employee.findOne({ 
    email,
    company: req.user.company
  });
  
  if (existingEmployee) {
    throw new AppError('An employee with this email already exists', 400);
  }
  
  const employee = new Employee({
    firstName,
    lastName,
    email,
    phone,
    department,
    role,
    startDate,
    company: req.user.company
  });
  
  await employee.save();
  
  // Populate department and role information
  await employee.populate('department');
  await employee.populate('role');
  
  res.status(201).json({
    success: true,
    message: 'Employee created successfully',
    data: employee
  });
});

// Get employee by ID
const getEmployeeById = catchAsync(async (req, res) => {
  const employee = await Employee.findOne({
    _id: req.params.id,
    company: req.user.company
  })
    .populate('department')
    .populate('role');
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  
  res.status(200).json({
    success: true,
    data: employee
  });
});

// Update employee
const updateEmployee = catchAsync(async (req, res) => {
  const { firstName, lastName, email, phone, department, role, startDate } = req.body;
  
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
  
  // Check if role exists and belongs to the company
  if (role) {
    const roleExists = await Role.findOne({
      _id: role,
      company: req.user.company
    });
    
    if (!roleExists) {
      throw new AppError('Role not found', 404);
    }
    
    // Check if the role belongs to the department
    if (department && roleExists.department.toString() !== department) {
      throw new AppError('Role does not belong to the selected department', 400);
    }
  }
  
  // Check if email is already used by another employee
  if (email) {
    const existingEmployee = await Employee.findOne({ 
      email,
      _id: { $ne: req.params.id },
      company: req.user.company
    });
    
    if (existingEmployee) {
      throw new AppError('An employee with this email already exists', 400);
    }
  }
  
  const employee = await Employee.findOneAndUpdate(
    { _id: req.params.id, company: req.user.company },
    { firstName, lastName, email, phone, department, role, startDate },
    { new: true, runValidators: true }
  )
    .populate('department')
    .populate('role');
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Employee updated successfully',
    data: employee
  });
});

// Delete employee
const deleteEmployee = catchAsync(async (req, res) => {
  const employee = await Employee.findOneAndDelete({
    _id: req.params.id,
    company: req.user.company
  });
  
  if (!employee) {
    throw new AppError('Employee not found', 404);
  }
  
  res.status(200).json({
    success: true,
    message: 'Employee deleted successfully'
  });
});

// Get employees by department
const getEmployeesByDepartment = catchAsync(async (req, res) => {
  const { departmentId } = req.params;
  
  // Check if department exists and belongs to the company
  const departmentExists = await Department.findOne({
    _id: departmentId,
    company: req.user.company
  });
  
  if (!departmentExists) {
    throw new AppError('Department not found', 404);
  }
  
  const employees = await Employee.find({
    department: departmentId,
    company: req.user.company
  })
    .populate('department')
    .populate('role');
  
  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

// Get employees by role
const getEmployeesByRole = catchAsync(async (req, res) => {
  const { roleId } = req.params;
  
  // Check if role exists and belongs to the company
  const roleExists = await Role.findOne({
    _id: roleId,
    company: req.user.company
  });
  
  if (!roleExists) {
    throw new AppError('Role not found', 404);
  }
  
  const employees = await Employee.find({
    role: roleId,
    company: req.user.company
  })
    .populate('department')
    .populate('role');
  
  res.status(200).json({
    success: true,
    count: employees.length,
    data: employees
  });
});

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeesByDepartment,
  getEmployeesByRole
};
