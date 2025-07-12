const menuService = require('../services/menuService');
const { validationResult } = require('express-validator');

class MenuController {
  // Create menu item (admin only)
  async createMenuItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const menuItem = await menuService.createMenuItem(req.body, req.file);
      
      res.status(201).json({
        success: true,
        message: 'Menu item created successfully',
        menuItem
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all menu items
  async getAllMenuItems(req, res) {
    try {
      const filters = {
        available: req.query.available,
        minPrice: req.query.minPrice,
        maxPrice: req.query.maxPrice
      };

      const menuItems = await menuService.getAllMenuItems(filters);
      
      res.json({
        success: true,
        count: menuItems.length,
        menuItems
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get available menu items only
  async getAvailableMenuItems(req, res) {
    try {
      const menuItems = await menuService.getAvailableMenuItems();
      
      res.json({
        success: true,
        count: menuItems.length,
        menuItems
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get menu item by ID
  async getMenuItemById(req, res) {
    try {
      const menuItem = await menuService.getMenuItemById(req.params.id);
      
      res.json({
        success: true,
        menuItem
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Update menu item (admin only)
  async updateMenuItem(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const menuItem = await menuService.updateMenuItem(req.params.id, req.body, req.file);
      
      res.json({
        success: true,
        message: 'Menu item updated successfully',
        menuItem
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Delete menu item (admin only)
  async deleteMenuItem(req, res) {
    try {
      await menuService.deleteMenuItem(req.params.id);
      
      res.json({
        success: true,
        message: 'Menu item deleted successfully'
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Toggle availability (admin only)
  async toggleAvailability(req, res) {
    try {
      const menuItem = await menuService.toggleAvailability(req.params.id);
      
      res.json({
        success: true,
        message: `Menu item ${menuItem.available ? 'enabled' : 'disabled'} successfully`,
        menuItem
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Search menu items
  async searchMenuItems(req, res) {
    try {
      const { q } = req.query;
      if (!q || q.trim().length < 2) {
        return res.status(400).json({ 
          success: false, 
          message: 'Search term must be at least 2 characters' 
        });
      }

      const menuItems = await menuService.searchMenuItems(q.trim());
      
      res.json({
        success: true,
        count: menuItems.length,
        searchTerm: q,
        menuItems
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new MenuController(); 