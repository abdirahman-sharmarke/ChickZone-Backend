const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadMenuImage } = require('../middleware/upload');
const { validateCreateMenu, validateUpdateMenu, validateMenuId } = require('../middleware/menuValidation');

// Public routes
router.get('/menu', menuController.getAvailableMenuItems);
router.get('/menu/all', menuController.getAllMenuItems);
router.get('/menu/search', menuController.searchMenuItems);
router.get('/menu/:id', validateMenuId, menuController.getMenuItemById);

// Admin only routes
router.post('/menu', authenticateToken, requireAdmin, uploadMenuImage, validateCreateMenu, menuController.createMenuItem);
router.put('/menu/:id', authenticateToken, requireAdmin, uploadMenuImage, validateMenuId, validateUpdateMenu, menuController.updateMenuItem);
router.patch('/menu/:id/toggle', authenticateToken, requireAdmin, validateMenuId, menuController.toggleAvailability);
router.delete('/menu/:id', authenticateToken, requireAdmin, validateMenuId, menuController.deleteMenuItem);

module.exports = router; 