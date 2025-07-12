const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const auth = require('../middleware/auth');

// User routes - require authentication
router.post('/fcm-token', auth.authenticateToken, notificationController.updateFCMToken);
router.post('/test', auth.authenticateToken, notificationController.testNotification);
router.get('/my-notifications', auth.authenticateToken, notificationController.getUserNotifications);
router.put('/mark-read/:notificationId', auth.authenticateToken, notificationController.markNotificationAsRead);
router.put('/mark-all-read', auth.authenticateToken, notificationController.markAllNotificationsAsRead);

// Admin routes - require admin authentication
router.post('/send-to-user', auth.authenticateToken, auth.requireAdmin, notificationController.sendNotificationToUser);
router.post('/send-to-users', auth.authenticateToken, auth.requireAdmin, notificationController.sendNotificationToUsers);
router.post('/send-to-all', auth.authenticateToken, auth.requireAdmin, notificationController.sendNotificationToAll);
router.get('/users', auth.authenticateToken, auth.requireAdmin, notificationController.getAllUsers);
router.get('/users/:role', auth.authenticateToken, auth.requireAdmin, notificationController.getUsersByRole);
router.get('/all', auth.authenticateToken, auth.requireAdmin, notificationController.getAllNotifications);
router.get('/stats', auth.authenticateToken, auth.requireAdmin, notificationController.getNotificationStats);
router.delete('/:notificationId', auth.authenticateToken, auth.requireAdmin, notificationController.deleteNotification);

module.exports = router; 