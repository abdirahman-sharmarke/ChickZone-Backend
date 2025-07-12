const notificationService = require('../services/notificationService');
const { User, Notification } = require('../models');

class NotificationController {
  // Update FCM token for a user
  async updateFCMToken(req, res) {
    try {
      const { token } = req.body;
      const userId = req.user.id;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'FCM token is required'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      await user.update({ fcmToken: token });

      // Subscribe user to the all_users topic
      await notificationService.subscribeToTopic([token], 'all_users');

      res.json({
        success: true,
        message: 'FCM token updated successfully'
      });
    } catch (error) {
      console.error('Error updating FCM token:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update FCM token',
        error: error.message
      });
    }
  }

  // Send manual notification to specific user
  async sendNotificationToUser(req, res) {
    try {
      const { userId, title, body, data } = req.body;

      if (!userId || !title || !body) {
        return res.status(400).json({
          success: false,
          message: 'User ID, title, and body are required'
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!user.fcmToken) {
        return res.status(400).json({
          success: false,
          message: 'User does not have an FCM token'
        });
      }

      const result = await notificationService.sendToDevice(
        user.fcmToken,
        title,
        body,
        data || {},
        user.id,
        req.user.id
      );

      res.json({
        success: result.success,
        message: result.success ? 'Notification sent successfully' : 'Failed to send notification',
        data: result
      });
    } catch (error) {
      console.error('Error sending notification to user:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message
      });
    }
  }

  // Send manual notification to multiple users
  async sendNotificationToUsers(req, res) {
    try {
      const { userIds, title, body, data } = req.body;

      if (!userIds || !Array.isArray(userIds) || !title || !body) {
        return res.status(400).json({
          success: false,
          message: 'User IDs array, title, and body are required'
        });
      }

      const users = await User.findAll({
        where: { id: userIds },
        attributes: ['id', 'fullName', 'fcmToken']
      });

      if (users.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No users found'
        });
      }

      const tokens = users
        .filter(user => user.fcmToken)
        .map(user => user.fcmToken);

      if (tokens.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No users have FCM tokens'
        });
      }

      const result = await notificationService.sendToMultipleDevices(
        tokens,
        title,
        body,
        data || {},
        userIds,
        req.user.id
      );

      res.json({
        success: result.success,
        message: result.success ? 'Notifications sent successfully' : 'Failed to send notifications',
        data: {
          totalUsers: users.length,
          usersWithTokens: tokens.length,
          ...result
        }
      });
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notifications',
        error: error.message
      });
    }
  }

  // Send notification to all users
  async sendNotificationToAll(req, res) {
    try {
      const { title, body, data } = req.body;

      if (!title || !body) {
        return res.status(400).json({
          success: false,
          message: 'Title and body are required'
        });
      }

      const result = await notificationService.sendAdminNotification(
        title,
        body,
        data || {},
        req.user.id
      );

      res.json({
        success: result.success,
        message: result.success ? 'Notification sent to all users' : 'Failed to send notification',
        data: result
      });
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send notification',
        error: error.message
      });
    }
  }

  // Get all users with their FCM tokens (for admin)
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll({
        attributes: ['id', 'fullName', 'email', 'role', 'fcmToken', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      const usersWithTokens = users.filter(user => user.fcmToken);

      res.json({
        success: true,
        data: {
          totalUsers: users.length,
          usersWithTokens: usersWithTokens.length,
          users: users
        }
      });
    } catch (error) {
      console.error('Error getting all users:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  }

  // Get users by role (for admin)
  async getUsersByRole(req, res) {
    try {
      const { role } = req.params;

      if (!['admin', 'customer'].includes(role)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid role. Use "admin" or "customer"'
        });
      }

      const users = await User.findAll({
        where: { role: role },
        attributes: ['id', 'fullName', 'email', 'role', 'fcmToken', 'createdAt'],
        order: [['createdAt', 'DESC']]
      });

      const usersWithTokens = users.filter(user => user.fcmToken);

      res.json({
        success: true,
        data: {
          totalUsers: users.length,
          usersWithTokens: usersWithTokens.length,
          users: users
        }
      });
    } catch (error) {
      console.error('Error getting users by role:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users',
        error: error.message
      });
    }
  }

  // Test notification (for development)
  async testNotification(req, res) {
    try {
      const { title = 'Test Notification', body = 'This is a test notification from ChickZone!' } = req.body;
      const userId = req.user.id;

      const user = await User.findByPk(userId);
      if (!user || !user.fcmToken) {
        return res.status(400).json({
          success: false,
          message: 'User not found or FCM token not available'
        });
      }

      const result = await notificationService.sendToDevice(
        user.fcmToken,
        title,
        body,
        { type: 'test_notification' },
        user.id,
        req.user.id
      );

      res.json({
        success: result.success,
        message: result.success ? 'Test notification sent successfully' : 'Failed to send test notification',
        data: result
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send test notification',
        error: error.message
      });
    }
  }

  // Get all notifications (admin only)
  async getAllNotifications(req, res) {
    try {
      const { page = 1, limit = 20, status, type, userId } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (status) whereClause.status = status;
      if (type) whereClause.type = type;
      if (userId) whereClause.userId = userId;

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'recipient',
            attributes: ['id', 'fullName', 'email']
          },
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'fullName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          notifications: notifications.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(notifications.count / limit),
            totalItems: notifications.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting all notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  }

  // Get user's notifications
  async getUserNotifications(req, res) {
    try {
      const { page = 1, limit = 20, isRead, type } = req.query;
      const offset = (page - 1) * limit;
      const userId = req.user.id;

      const whereClause = { userId: userId };
      if (isRead !== undefined) whereClause.isRead = isRead === 'true';
      if (type) whereClause.type = type;

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['id', 'fullName', 'email']
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: offset
      });

      res.json({
        success: true,
        data: {
          notifications: notifications.rows,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(notifications.count / limit),
            totalItems: notifications.count,
            itemsPerPage: parseInt(limit)
          }
        }
      });
    } catch (error) {
      console.error('Error getting user notifications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notifications',
        error: error.message
      });
    }
  }

  // Mark notification as read
  async markNotificationAsRead(req, res) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({
        where: { id: notificationId, userId: userId }
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.update({ isRead: true });

      res.json({
        success: true,
        message: 'Notification marked as read'
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark notification as read',
        error: error.message
      });
    }
  }

  // Mark all notifications as read
  async markAllNotificationsAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { isRead: true },
        { where: { userId: userId, isRead: false } }
      );

      res.json({
        success: true,
        message: 'All notifications marked as read'
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark all notifications as read',
        error: error.message
      });
    }
  }

  // Get notification statistics
  async getNotificationStats(req, res) {
    try {
      const totalNotifications = await Notification.count();
      const sentNotifications = await Notification.count({ where: { status: 'sent' } });
      const failedNotifications = await Notification.count({ where: { status: 'failed' } });
      const pendingNotifications = await Notification.count({ where: { status: 'pending' } });

      const notificationsByType = await Notification.findAll({
        attributes: ['type', [Notification.sequelize.fn('COUNT', Notification.sequelize.col('id')), 'count']],
        group: ['type']
      });

      const recentNotifications = await Notification.findAll({
        limit: 5,
        order: [['createdAt', 'DESC']],
        include: [
          {
            model: User,
            as: 'recipient',
            attributes: ['id', 'fullName', 'email']
          }
        ]
      });

      res.json({
        success: true,
        data: {
          totalNotifications,
          sentNotifications,
          failedNotifications,
          pendingNotifications,
          notificationsByType,
          recentNotifications
        }
      });
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get notification statistics',
        error: error.message
      });
    }
  }

  // Delete notification (admin only)
  async deleteNotification(req, res) {
    try {
      const { notificationId } = req.params;

      const notification = await Notification.findByPk(notificationId);
      if (!notification) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: 'Notification deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete notification',
        error: error.message
      });
    }
  }
}

module.exports = new NotificationController(); 