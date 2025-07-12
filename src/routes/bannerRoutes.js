const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/bannerController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadBannerImage } = require('../middleware/upload');
const { validateCreateBanner, validateUpdateBanner, validateBannerId } = require('../middleware/bannerValidation');

// Public routes
router.get('/banners/active', bannerController.getActiveBanners);
router.get('/banners/:id', validateBannerId, bannerController.getBannerById);

// Admin only routes
router.get('/banners', authenticateToken, requireAdmin, bannerController.getAllBanners);
router.post('/banners', authenticateToken, requireAdmin, uploadBannerImage, validateCreateBanner, bannerController.createBanner);
router.put('/banners/:id', authenticateToken, requireAdmin, uploadBannerImage, validateBannerId, validateUpdateBanner, bannerController.updateBanner);
router.patch('/banners/:id/toggle', authenticateToken, requireAdmin, validateBannerId, bannerController.toggleBannerStatus);
router.patch('/banners/:id/order', authenticateToken, requireAdmin, validateBannerId, bannerController.updateDisplayOrder);
router.patch('/banners/reorder', authenticateToken, requireAdmin, bannerController.reorderBanners);
router.delete('/banners/:id', authenticateToken, requireAdmin, validateBannerId, bannerController.deleteBanner);

module.exports = router; 