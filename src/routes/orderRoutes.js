const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { validateCreateOrder, validateUpdateStatus, validateOrderId } = require('../middleware/orderValidation');

// User routes (authentication required)
router.post('/orders', authenticateToken, validateCreateOrder, orderController.createOrder);
router.get('/orders/my', authenticateToken, orderController.getMyOrders);
router.patch('/orders/:id/cancel', authenticateToken, validateOrderId, orderController.cancelOrder);
router.get('/orders/:id', authenticateToken, validateOrderId, orderController.getOrderById);

// Admin routes
router.get('/orders', authenticateToken, requireAdmin, orderController.getAllOrders);
router.patch('/orders/:id/status', authenticateToken, requireAdmin, validateOrderId, validateUpdateStatus, orderController.updateOrderStatus);
router.get('/orders/stats/overview', authenticateToken, requireAdmin, orderController.getOrderStats);

module.exports = router; 