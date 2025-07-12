const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadCategoryImage } = require('../middleware/upload');
const { validateCreateCategory, validateUpdateCategory, validateCategoryId } = require('../middleware/categoryValidation');

// Public routes
router.get('/categories/active', categoryController.getActiveCategories);
router.get('/categories/search', categoryController.searchCategories);
router.get('/categories/:id', validateCategoryId, categoryController.getCategoryById);

// Admin only routes
router.get('/categories', authenticateToken, requireAdmin, categoryController.getAllCategories);
router.get('/categories/stats', authenticateToken, requireAdmin, categoryController.getCategoryStats);
router.post('/categories', uploadCategoryImage, validateCreateCategory, categoryController.createCategory);
router.put('/categories/:id', authenticateToken, requireAdmin, uploadCategoryImage, validateCategoryId, validateUpdateCategory, categoryController.updateCategory);
router.patch('/categories/:id/toggle', authenticateToken, requireAdmin, validateCategoryId, categoryController.toggleCategoryStatus);
router.patch('/categories/:id/order', authenticateToken, requireAdmin, validateCategoryId, categoryController.updateDisplayOrder);
router.patch('/categories/reorder', authenticateToken, requireAdmin, categoryController.reorderCategories);
router.delete('/categories/:id', authenticateToken, requireAdmin, validateCategoryId, categoryController.deleteCategory);

module.exports = router; 