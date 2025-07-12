const categoryService = require('../services/categoryService');
const { validationResult } = require('express-validator');

class CategoryController {
  // Create category (admin only)
  async createCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await categoryService.createCategory(req.body, req.file);
      
      res.status(201).json({
        success: true,
        message: 'Category created successfully',
        category
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all categories (admin)
  async getAllCategories(req, res) {
    try {
      const filters = {
        isActive: req.query.isActive,
        includeMenuItems: req.query.includeMenuItems
      };

      const categories = await categoryService.getAllCategories(filters);
      
      res.json({
        success: true,
        count: categories.length,
        categories
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get active categories only (public)
  async getActiveCategories(req, res) {
    try {
      const includeMenuItems = req.query.includeMenuItems === 'true';
      const categories = await categoryService.getActiveCategories(includeMenuItems);
      
      res.json({
        success: true,
        count: categories.length,
        categories
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get category by ID
  async getCategoryById(req, res) {
    try {
      const includeMenuItems = req.query.includeMenuItems === 'true';
      const category = await categoryService.getCategoryById(req.params.id, includeMenuItems);
      
      res.json({
        success: true,
        category
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Update category (admin only)
  async updateCategory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const category = await categoryService.updateCategory(req.params.id, req.body, req.file);
      
      res.json({
        success: true,
        message: 'Category updated successfully',
        category
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete category (admin only)
  async deleteCategory(req, res) {
    try {
      await categoryService.deleteCategory(req.params.id);
      
      res.json({
        success: true,
        message: 'Category deleted successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Toggle category status (admin only)
  async toggleCategoryStatus(req, res) {
    try {
      const category = await categoryService.toggleCategoryStatus(req.params.id);
      
      res.json({
        success: true,
        message: `Category ${category.isActive ? 'activated' : 'deactivated'} successfully`,
        category
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Update display order (admin only)
  async updateDisplayOrder(req, res) {
    try {
      const { displayOrder } = req.body;
      const category = await categoryService.updateDisplayOrder(req.params.id, displayOrder);
      
      res.json({
        success: true,
        message: 'Category display order updated successfully',
        category
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Reorder categories (admin only)
  async reorderCategories(req, res) {
    try {
      const { categoryOrders } = req.body;
      const categories = await categoryService.reorderCategories(categoryOrders);
      
      res.json({
        success: true,
        message: 'Categories reordered successfully',
        categories
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get category stats (admin only)
  async getCategoryStats(req, res) {
    try {
      const stats = await categoryService.getCategoryStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Search categories
  async searchCategories(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Search term must be at least 2 characters' 
        });
      }

      const categories = await categoryService.searchCategories(q.trim());
      
      res.json({
        success: true,
        count: categories.length,
        searchTerm: q,
        categories
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new CategoryController(); 