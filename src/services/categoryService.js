const { Category, Menu } = require('../models');
const path = require('path');
const fs = require('fs');

class CategoryService {
  // Create new category
  async createCategory(categoryData, imageFile) {
    if (imageFile) {
      categoryData.image = imageFile.filename;
    }
    return await Category.create(categoryData);
  }

  // Get all categories with filters
  async getAllCategories(filters = {}) {
    const whereClause = {};
    
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    const includeMenuItems = filters.includeMenuItems === 'true';

    return await Category.findAll({
      where: whereClause,
      include: includeMenuItems ? [{
        model: Menu,
        as: 'menuItems',
        where: { available: true },
        required: false
      }] : [],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  // Get active categories only (for public display)
  async getActiveCategories(includeMenuItems = false) {
    return await Category.findAll({
      where: { isActive: true },
      include: includeMenuItems ? [{
        model: Menu,
        as: 'menuItems',
        where: { available: true },
        required: false
      }] : [],
      order: [['displayOrder', 'ASC'], ['name', 'ASC']]
    });
  }

  // Get category by ID
  async getCategoryById(id, includeMenuItems = false) {
    const category = await Category.findByPk(id, {
      include: includeMenuItems ? [{
        model: Menu,
        as: 'menuItems',
        order: [['name', 'ASC']]
      }] : []
    });
    
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  }

  // Update category
  async updateCategory(id, updateData, imageFile) {
    const category = await this.getCategoryById(id);

    // Handle image upload
    if (imageFile) {
      // Delete old image if exists
      if (category.image) {
        const oldPath = path.join('uploads', category.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.image = imageFile.filename;
    }

    return await category.update(updateData);
  }

  // Delete category
  async deleteCategory(id) {
    const category = await this.getCategoryById(id, true);

    // Check if category has menu items
    if (category.menuItems && category.menuItems.length > 0) {
      throw new Error('Cannot delete category that contains menu items. Please move or delete menu items first.');
    }

    // Delete image if exists
    if (category.image) {
      const imagePath = path.join('uploads', category.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await category.destroy();
  }

  // Toggle category status
  async toggleCategoryStatus(id) {
    const category = await this.getCategoryById(id);
    return await category.update({ isActive: !category.isActive });
  }

  // Update display order
  async updateDisplayOrder(id, newOrder) {
    const category = await this.getCategoryById(id);
    return await category.update({ displayOrder: newOrder });
  }

  // Reorder categories
  async reorderCategories(categoryOrders) {
    const updatePromises = categoryOrders.map(({ id, displayOrder }) =>
      Category.update({ displayOrder }, { where: { id } })
    );
    
    await Promise.all(updatePromises);
    return await this.getAllCategories();
  }

  // Get category stats
  async getCategoryStats() {
    const totalCategories = await Category.count();
    const activeCategories = await Category.count({ where: { isActive: true } });
    const categoriesWithItems = await Category.count({
      include: [{
        model: Menu,
        as: 'menuItems',
        required: true
      }]
    });

    return {
      totalCategories,
      activeCategories,
      inactiveCategories: totalCategories - activeCategories,
      categoriesWithItems,
      emptyCategoryCount: totalCategories - categoriesWithItems
    };
  }

  // Search categories
  async searchCategories(searchTerm) {
    const { Op } = require('sequelize');
    return await Category.findAll({
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

module.exports = new CategoryService(); 