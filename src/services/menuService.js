const { Menu } = require('../models');
const path = require('path');
const fs = require('fs');

class MenuService {
  // Create new menu item
  async createMenuItem(menuData, imageFile) {
    // Clean up price - remove $ and convert to number
    if (menuData.price) {
      menuData.price = parseFloat(menuData.price.toString().replace(/[$,]/g, ''));
    }
    
    if (imageFile) {
      menuData.image = imageFile.filename;
    }
    return await Menu.create(menuData);
  }

  // Get all menu items with filters
  async getAllMenuItems(filters = {}) {
    const { Op } = require('sequelize');
    const whereClause = {};
    
    if (filters.available !== undefined) {
      whereClause.available = filters.available;
    }
    
    if (filters.minPrice) {
      whereClause.price = { ...whereClause.price, [Op.gte]: filters.minPrice };
    }
    
    if (filters.maxPrice) {
      whereClause.price = { ...whereClause.price, [Op.lte]: filters.maxPrice };
    }

    return await Menu.findAll({
      where: whereClause,
      order: [['name', 'ASC']]
    });
  }

  // Get menu item by ID
  async getMenuItemById(id) {
    const menuItem = await Menu.findByPk(id);
    if (!menuItem) {
      throw new Error('Menu item not found');
    }
    return menuItem;
  }

  // Update menu item
  async updateMenuItem(id, updateData, imageFile) {
    const menuItem = await this.getMenuItemById(id);

    // Clean up price - remove $ and convert to number
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price.toString().replace(/[$,]/g, ''));
    }

    // Handle image upload
    if (imageFile) {
      // Delete old image if exists
      if (menuItem.image) {
        const oldPath = path.join('uploads', menuItem.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.image = imageFile.filename;
    }

    return await menuItem.update(updateData);
  }

  // Delete menu item
  async deleteMenuItem(id) {
    const menuItem = await this.getMenuItemById(id);

    // Delete image if exists
    if (menuItem.image) {
      const imagePath = path.join('uploads', menuItem.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await menuItem.destroy();
  }

  // Toggle availability
  async toggleAvailability(id) {
    const menuItem = await this.getMenuItemById(id);
    return await menuItem.update({ available: !menuItem.available });
  }

  // Get available menu items only
  async getAvailableMenuItems() {
    return await Menu.findAll({
      where: { available: true },
      order: [['name', 'ASC']]
    });
  }

  // Search menu items
  async searchMenuItems(searchTerm) {
    const { Op } = require('sequelize');
    return await Menu.findAll({
      where: {
        [Op.or]: [
          { name: { [Op.iLike]: `%${searchTerm}%` } },
          { description: { [Op.iLike]: `%${searchTerm}%` } }
        ]
      },
      order: [['name', 'ASC']]
    });
  }
}

module.exports = new MenuService(); 