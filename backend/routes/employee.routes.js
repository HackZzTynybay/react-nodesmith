
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employee.controller');
const validate = require('../middleware/validate');
const employeeValidation = require('../validations/employee.validation');
const auth = require('../middleware/auth');

// Get all employees
router.get('/', auth, employeeController.getAllEmployees);

// Create employee
router.post(
  '/',
  auth,
  validate(employeeValidation.employeeSchema),
  employeeController.createEmployee
);

// Get employee by ID
router.get('/:id', auth, employeeController.getEmployeeById);

// Update employee
router.put(
  '/:id',
  auth,
  validate(employeeValidation.employeeSchema),
  employeeController.updateEmployee
);

// Delete employee
router.delete('/:id', auth, employeeController.deleteEmployee);

// Get employees by department
router.get('/department/:departmentId', auth, employeeController.getEmployeesByDepartment);

// Get employees by role
router.get('/role/:roleId', auth, employeeController.getEmployeesByRole);

module.exports = router;
