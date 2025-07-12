const { Order, User, Menu } = require('../models');

class OrderService {
  // Create new order
  async createOrder(userId, orderData) {
    const { items } = orderData;
    
    // Validate and process items
    const processedItems = await this.validateAndProcessItems(items);
    
    // Calculate total price
    const totalPrice = this.calculateTotalPrice(processedItems);
    
    const order = await Order.create({
      userId,
      items: processedItems,
      totalPrice,
      status: 'pending'
    });

    return await this.getOrderById(order.id);
  }

  // Validate items and get current prices
  async validateAndProcessItems(items) {
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const processedItems = [];
    
    for (const item of items) {
      if (!item.menuId || !item.quantity || item.quantity < 1) {
        throw new Error('Each item must have menuId and quantity >= 1');
      }

      // Get menu item details
      const menuItem = await Menu.findByPk(item.menuId);
      if (!menuItem) {
        throw new Error(`Menu item with ID ${item.menuId} not found`);
      }

      if (!menuItem.available) {
        throw new Error(`Menu item "${menuItem.name}" is not available`);
      }

      processedItems.push({
        menuId: menuItem.id,
        name: menuItem.name,
        price: parseFloat(menuItem.price),
        discount: menuItem.discount || 0,
        quantity: parseInt(item.quantity),
        notes: item.notes || ''
      });
    }

    return processedItems;
  }

  // Calculate total price from items
  calculateTotalPrice(items) {
    return items.reduce((total, item) => {
      const itemTotal = item.price * item.quantity;
      const discountedPrice = itemTotal * (1 - (item.discount || 0) / 100);
      return total + discountedPrice;
    }, 0).toFixed(2);
  }

  // Get order by ID with user details
  async getOrderById(id) {
    const order = await Order.findByPk(id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }]
    });

    if (!order) {
      throw new Error('Order not found');
    }

    return order;
  }

  // Get all orders with filters
  async getAllOrders(filters = {}) {
    const whereClause = {};
    
    if (filters.status) {
      whereClause.status = filters.status;
    }
    
    if (filters.userId) {
      whereClause.userId = filters.userId;
    }

    return await Order.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'fullName', 'email']
      }],
      order: [['createdAt', 'DESC']]
    });
  }

  // Get user's orders
  async getUserOrders(userId) {
    return await Order.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });
  }

  // Update order status
  async updateOrderStatus(id, status) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    return await order.update({ status });
  }

  // Cancel order (only if pending or confirmed)
  async cancelOrder(id, userId = null) {
    const order = await Order.findByPk(id);
    if (!order) {
      throw new Error('Order not found');
    }

    // If userId provided, ensure user owns the order
    if (userId && order.userId !== userId) {
      throw new Error('You can only cancel your own orders');
    }

    if (!['pending', 'confirmed'].includes(order.status)) {
      throw new Error('Can only cancel pending or confirmed orders');
    }

    return await order.update({ status: 'cancelled' });
  }

  // Get order statistics
  async getOrderStats() {
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const completedOrders = await Order.count({ where: { status: 'delivered' } });
    
    const totalRevenue = await Order.sum('totalPrice', {
      where: { status: 'delivered' }
    });

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue || 0
    };
  }
}

module.exports = new OrderService(); 