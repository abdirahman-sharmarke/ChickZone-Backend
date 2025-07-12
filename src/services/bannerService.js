const { Banner } = require('../models');
const path = require('path');
const fs = require('fs');

class BannerService {
  // Create new banner
  async createBanner(bannerData, imageFile) {
    if (imageFile) {
      bannerData.image = imageFile.filename;
    }

    // If this is set as active, deactivate others if needed
    if (bannerData.isActive === true || bannerData.isActive === 'true') {
      const activeBanners = await Banner.count({ where: { isActive: true } });
      if (activeBanners >= 5) { // Limit to 5 active banners
        throw new Error('Maximum of 5 active banners allowed. Please deactivate another banner first.');
      }
    }

    return await Banner.create(bannerData);
  }

  // Get all banners with filters
  async getAllBanners(filters = {}) {
    const whereClause = {};
    
    if (filters.isActive !== undefined) {
      whereClause.isActive = filters.isActive;
    }

    return await Banner.findAll({
      where: whereClause,
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
    });
  }

  // Get active banners only (for public display)
  async getActiveBanners() {
    return await Banner.findAll({
      where: { isActive: true },
      order: [['displayOrder', 'ASC'], ['createdAt', 'DESC']]
    });
  }

  // Get banner by ID
  async getBannerById(id) {
    const banner = await Banner.findByPk(id);
    if (!banner) {
      throw new Error('Banner not found');
    }
    return banner;
  }

  // Update banner
  async updateBanner(id, updateData, imageFile) {
    const banner = await this.getBannerById(id);

    // Handle image upload
    if (imageFile) {
      // Delete old image if exists
      if (banner.image) {
        const oldPath = path.join('uploads', banner.image);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.image = imageFile.filename;
    }

    // Check active banner limit if activating
    if (updateData.isActive === true || updateData.isActive === 'true') {
      if (!banner.isActive) { // Only check if currently inactive
        const activeBanners = await Banner.count({ where: { isActive: true } });
        if (activeBanners >= 5) {
          throw new Error('Maximum of 5 active banners allowed. Please deactivate another banner first.');
        }
      }
    }

    return await banner.update(updateData);
  }

  // Delete banner
  async deleteBanner(id) {
    const banner = await this.getBannerById(id);

    // Delete image if exists
    if (banner.image) {
      const imagePath = path.join('uploads', banner.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await banner.destroy();
  }

  // Toggle banner status
  async toggleBannerStatus(id) {
    const banner = await this.getBannerById(id);
    
    // If activating, check limit
    if (!banner.isActive) {
      const activeBanners = await Banner.count({ where: { isActive: true } });
      if (activeBanners >= 5) {
        throw new Error('Maximum of 5 active banners allowed. Please deactivate another banner first.');
      }
    }

    return await banner.update({ isActive: !banner.isActive });
  }

  // Update display order
  async updateDisplayOrder(id, newOrder) {
    const banner = await this.getBannerById(id);
    return await banner.update({ displayOrder: newOrder });
  }

  // Reorder banners
  async reorderBanners(bannerOrders) {
    const updatePromises = bannerOrders.map(({ id, displayOrder }) =>
      Banner.update({ displayOrder }, { where: { id } })
    );
    
    await Promise.all(updatePromises);
    return await this.getAllBanners();
  }
}

module.exports = new BannerService(); 