const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadProfilePicture } = require('../middleware/upload');
const { validateRegister, validateLogin, validateUpdate } = require('../middleware/validation');

// Public routes
router.post('/register', uploadProfilePicture, validateRegister, userController.register);
router.post('/login', validateLogin, userController.login);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, userController.getProfile);
router.put('/profile', authenticateToken, uploadProfilePicture, validateUpdate, userController.updateProfile);

// Admin only routes
router.get('/users', authenticateToken, requireAdmin, userController.getAllUsers);
router.delete('/users/:id', authenticateToken, requireAdmin, userController.deleteUser);

// Serve uploaded files
router.use('/uploads', express.static('uploads'));

module.exports = router; 