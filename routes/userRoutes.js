const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, adminOnly } = require('../middleware/authMiddleware');

// admin-only endpoints
router.get('/', verifyToken, adminOnly, userController.getAllUsers);
router.post('/admin/add', verifyToken, adminOnly, userController.addUserByAdmin);
router.put('/role/:id', verifyToken, adminOnly, userController.updateUserRole);
router.delete('/:id', verifyToken, adminOnly, userController.deleteUser);

module.exports = router;
