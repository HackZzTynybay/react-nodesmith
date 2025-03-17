
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/department.controller');
const validate = require('../middleware/validate');
const departmentValidation = require('../validations/department.validation');
const auth = require('../middleware/auth');

// Get all departments
router.get('/', auth, departmentController.getAllDepartments);

// Create department
router.post(
  '/',
  auth,
  validate(departmentValidation.departmentSchema),
  departmentController.createDepartment
);

// Get department by ID
router.get('/:id', auth, departmentController.getDepartmentById);

// Update department
router.put(
  '/:id',
  auth,
  validate(departmentValidation.departmentSchema),
  departmentController.updateDepartment
);

// Delete department
router.delete('/:id', auth, departmentController.deleteDepartment);

module.exports = router;
