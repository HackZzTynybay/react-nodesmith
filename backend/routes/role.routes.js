
const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller');
const validate = require('../middleware/validate');
const roleValidation = require('../validations/role.validation');
const auth = require('../middleware/auth');

// Get all roles
router.get('/', auth, roleController.getAllRoles);

// Create role
router.post(
  '/',
  auth,
  validate(roleValidation.roleSchema),
  roleController.createRole
);

// Get role by ID
router.get('/:id', auth, roleController.getRoleById);

// Update role
router.put(
  '/:id',
  auth,
  validate(roleValidation.roleSchema),
  roleController.updateRole
);

// Delete role
router.delete('/:id', auth, roleController.deleteRole);

// Get roles by department
router.get('/department/:departmentId', auth, roleController.getRolesByDepartment);

module.exports = router;
