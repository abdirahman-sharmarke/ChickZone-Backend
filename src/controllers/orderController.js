const orderService = require('../services/orderService');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');
const { User } = require('../models');

class OrderController {
  // Create new order
  async createOrder(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const order = await orderService.createOrder(req.userId, req.body);
      
      // Send notification to user about new order
      try {
        const user = await User.findByPk(req.userId);
        if (user && user.fcmToken) {
          await notificationService.sendOrderConfirmation(
            user.fcmToken,
            order.id,
            order.totalPrice,
            user.id
          );
        }
      } catch (notificationError) {
        console.error('Error sending order confirmation notification:', notificationError);
        // Don't fail the order creation if notification fails
      }
      
      res.status(201).json({
        success: true,
        message: 'Order created successfully',
        order
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get user's orders
  async getMyOrders(req, res) {
    try {
      const orders = await orderService.getUserOrders(req.userId);
      
      res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Get order by ID (user can only see their own orders)
  async getOrderById(req, res) {
    try {
      const order = await orderService.getOrderById(req.params.id);
      
      // Check if user owns this order or is admin
      if (order.userId !== req.userId && req.userRole !== 'admin') {
        return res.status(403).json({ 
          success: false, 
          message: 'You can only view your own orders' 
        });
      }
      
      res.json({
        success: true,
        order
      });
    } catch (error) {
      res.status(404).json({ success: false, message: error.message });
    }
  }

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const userId = req.userRole === 'admin' ? null : req.userId;
      const order = await orderService.cancelOrder(req.params.id, userId);
      
      res.json({
        success: true,
        message: 'Order cancelled successfully',
        order
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all orders (admin only)
  async getAllOrders(req, res) {
    try {
      const filters = {
        status: req.query.status,
        userId: req.query.userId
      };

      const orders = await orderService.getAllOrders(filters);
      
      res.json({
        success: true,
        count: orders.length,
        orders
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update order status (admin only)
  async updateOrderStatus(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const order = await orderService.updateOrderStatus(req.params.id, req.body.status);
      
      // Send notification to user about order status update
      try {
        const user = await User.findByPk(order.userId);
        if (user && user.fcmToken) {
          // Send specific notification for "ready" status
          if (req.body.status === 'ready') {
            await notificationService.sendOrderReady(user.fcmToken, order.id, user.id);
          } else {
            // Send general order update notification for other statuses
            await notificationService.sendOrderUpdate(user.fcmToken, order.id, req.body.status, user.id);
          }
        }
      } catch (notificationError) {
        console.error('Error sending order update notification:', notificationError);
        // Don't fail the status update if notification fails
      }
      
      res.json({
        success: true,
        message: 'Order status updated successfully',
        order
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get order statistics (admin only)
  async getOrderStats(req, res) {
    try {
      const stats = await orderService.getOrderStats();
      
      res.json({
        success: true,
        stats
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new OrderController(); 