const bannerService = require('../services/bannerService');
const { validationResult } = require('express-validator');

class BannerController {
  // Create banner (admin only)
  async createBanner(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const banner = await bannerService.createBanner(req.body, req.file);
      
      res.status(201).json({
        success: true,
        message: 'Banner created successfully',
        banner
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all banners (admin)
  async getAllBanners(req, res) {
    try {
      const filters = {
        isActive: req.query.isActive
      };

      const banners = await bannerService.getAllBanners(filters);
      
      res.json({
        success: true,
        count: banners.length,
        banners
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get active banners only (public)
  async getActiveBanners(req, res) {
    try {
      const banners = await bannerService.getActiveBanners();
      
      res.json({
        success: true,
        count: banners.length,
        banners
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get banner by ID
  async getBannerById(req, res) {
    try {
      const banner = await bannerService.getBannerById(req.params.id);
      
      res.json({
        success: true,
        banner
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Update banner (admin only)
  async updateBanner(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const banner = await bannerService.updateBanner(req.params.id, req.body, req.file);
      
      res.json({
        success: true,
        message: 'Banner updated successfully',
        banner
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete banner (admin only)
  async deleteBanner(req, res) {
    try {
      await bannerService.deleteBanner(req.params.id);
      
      res.json({
        success: true,
        message: 'Banner deleted successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Toggle banner status (admin only)
  async toggleBannerStatus(req, res) {
    try {
      const banner = await bannerService.toggleBannerStatus(req.params.id);
      
      res.json({
        success: true,
        message: `Banner ${banner.isActive ? 'activated' : 'deactivated'} successfully`,
        banner
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Update display order (admin only)
  async updateDisplayOrder(req, res) {
    try {
      const { displayOrder } = req.body;
      const banner = await bannerService.updateDisplayOrder(req.params.id, displayOrder);
      
      res.json({
        success: true,
        message: 'Banner display order updated successfully',
        banner
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Reorder banners (admin only)
  async reorderBanners(req, res) {
    try {
      const { bannerOrders } = req.body;
      const banners = await bannerService.reorderBanners(bannerOrders);
      
      res.json({
        success: true,
        message: 'Banners reordered successfully',
        banners
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new BannerController(); 