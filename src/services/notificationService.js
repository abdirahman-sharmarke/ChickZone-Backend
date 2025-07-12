const admin = require('firebase-admin');
const path = require('path');
const { Notification } = require('../models');

// Initialize Firebase Admin SDK
let serviceAccount;

// Check if we should use environment variables (production) or JSON file (development)
const useEnvVars = process.env.NODE_ENV === 'production' || 
                   process.env.FIREBASE_PROJECT_ID || 
                   process.env.FIREBASE_PRIVATE_KEY || 
                   process.env.FIREBASE_CLIENT_EMAIL;

if (useEnvVars) {
  // Use environment variables in production
  serviceAccount = {
    type: 'service_account',
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
    private_key: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: process.env.FIREBASE_CLIENT_ID,
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
    universe_domain: 'googleapis.com'
  };
} else {
  // Use JSON file in development (if it exists)
  try {
    serviceAccount = require('../config/firebase-service-account.json');
  } catch (error) {
    throw new Error('Firebase service account JSON file not found and no environment variables provided. Please check your configuration.');
  }
}

// Validate required fields
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  throw new Error('Firebase configuration is incomplete. Please check your environment variables.');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: serviceAccount.project_id
});

class NotificationService {
  constructor() {
    this.messaging = admin.messaging();
  }

  // Send notification to a single device
  async sendToDevice(token, title, body, data = {}, userId = null, sentBy = null) {
    let notificationRecord = null;
    
    try {
      // Create notification record in database
      notificationRecord = await Notification.create({
        userId: userId,
        title: title,
        body: body,
        type: data.type || 'manual_notification',
        data: data,
        status: 'pending',
        sentBy: sentBy
      });

      const message = {
        token: token,
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          notificationId: notificationRecord.id.toString(),
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            sound: 'default',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      
      // Update notification record with success
      await notificationRecord.update({
        status: 'sent',
        sentAt: new Date(),
        fcmMessageId: response
      });

      console.log('Successfully sent message:', response);
      return { success: true, messageId: response, notificationId: notificationRecord.id };
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Update notification record with error
      if (notificationRecord) {
        await notificationRecord.update({
          status: 'failed',
          errorMessage: error.message
        });
      }
      
      return { success: false, error: error.message, notificationId: notificationRecord?.id };
    }
  }

  // Send notification to multiple devices
  async sendToMultipleDevices(tokens, title, body, data = {}, userIds = [], sentBy = null) {
    const notificationRecords = [];
    
    try {
      // Create notification records for each user
      for (let i = 0; i < userIds.length; i++) {
        const notificationRecord = await Notification.create({
          userId: userIds[i],
          title: title,
          body: body,
          type: data.type || 'manual_notification',
          data: data,
          status: 'pending',
          sentBy: sentBy
        });
        notificationRecords.push(notificationRecord);
      }

      const message = {
        tokens: tokens,
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            sound: 'default',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.sendEachForMulticast(message);
      
      // Update notification records based on response
      for (let i = 0; i < notificationRecords.length; i++) {
        const notificationRecord = notificationRecords[i];
        const fcmResponse = response.responses[i];
        
        if (fcmResponse.success) {
          await notificationRecord.update({
            status: 'sent',
            sentAt: new Date(),
            fcmMessageId: fcmResponse.messageId
          });
        } else {
          await notificationRecord.update({
            status: 'failed',
            errorMessage: fcmResponse.error?.message || 'Unknown error'
          });
        }
      }

      console.log('Successfully sent messages:', response);
      return { 
        success: true, 
        successCount: response.successCount,
        failureCount: response.failureCount,
        responses: response.responses,
        notificationIds: notificationRecords.map(n => n.id)
      };
    } catch (error) {
      console.error('Error sending messages:', error);
      
      // Update all notification records with error
      for (const notificationRecord of notificationRecords) {
        await notificationRecord.update({
          status: 'failed',
          errorMessage: error.message
        });
      }
      
      return { success: false, error: error.message };
    }
  }

  // Send notification to all users (topic-based)
  async sendToTopic(topic, title, body, data = {}) {
    try {
      const message = {
        topic: topic,
        notification: {
          title: title,
          body: body
        },
        data: {
          ...data,
          timestamp: new Date().toISOString()
        },
        android: {
          notification: {
            sound: 'default',
            priority: 'high'
          }
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1
            }
          }
        }
      };

      const response = await this.messaging.send(message);
      console.log('Successfully sent topic message:', response);
      return { success: true, messageId: response };
    } catch (error) {
      console.error('Error sending topic message:', error);
      return { success: false, error: error.message };
    }
  }

  // Subscribe a token to a topic
  async subscribeToTopic(tokens, topic) {
    try {
      const response = await this.messaging.subscribeToTopic(tokens, topic);
      console.log('Successfully subscribed to topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error subscribing to topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Unsubscribe a token from a topic
  async unsubscribeFromTopic(tokens, topic) {
    try {
      const response = await this.messaging.unsubscribeFromTopic(tokens, topic);
      console.log('Successfully unsubscribed from topic:', response);
      return { success: true, response };
    } catch (error) {
      console.error('Error unsubscribing from topic:', error);
      return { success: false, error: error.message };
    }
  }

  // Order-specific notification methods
  async sendOrderConfirmation(userToken, orderId, totalPrice, userId) {
    const title = '🎉 Order Confirmed!';
    const body = `Your order #${orderId} has been confirmed. Total: $${totalPrice}`;
    const data = {
      type: 'order_confirmed',
      orderId: orderId.toString(),
      totalPrice: totalPrice.toString()
    };

    return await this.sendToDevice(userToken, title, body, data, userId);
  }

  async sendOrderReady(userToken, orderId, userId) {
    const title = '🍗 Order Ready!';
    const body = `Your order #${orderId} is ready for pickup!`;
    const data = {
      type: 'order_ready',
      orderId: orderId.toString()
    };

    return await this.sendToDevice(userToken, title, body, data, userId);
  }

  async sendOrderUpdate(userToken, orderId, status, userId) {
    const statusMessages = {
      pending: 'Order received and pending confirmation',
      confirmed: 'Order confirmed and being prepared',
      preparing: 'Your order is being prepared',
      ready: 'Your order is ready for pickup!',
      delivered: 'Order delivered successfully',
      cancelled: 'Order has been cancelled'
    };

    const title = '📋 Order Update';
    const body = `Order #${orderId}: ${statusMessages[status]}`;
    const data = {
      type: 'order_update',
      orderId: orderId.toString(),
      status: status
    };

    return await this.sendToDevice(userToken, title, body, data, userId);
  }

  // Admin notification to all users
  async sendAdminNotification(title, body, data = {}, sentBy = null) {
    try {
      const { User } = require('../models');
      
      // Get all users with FCM tokens
      const users = await User.findAll({
        where: {
          fcmToken: {
            [require('sequelize').Op.ne]: null
          }
        },
        attributes: ['id', 'fcmToken']
      });

      if (users.length === 0) {
        console.log('No users with FCM tokens found');
        return { success: false, error: 'No users with FCM tokens found' };
      }

      // Create notification records for each user
      const notificationRecords = [];
      for (const user of users) {
        const notificationRecord = await Notification.create({
          userId: user.id,
          title: title,
          body: body,
          type: 'admin_notification',
          data: data,
          status: 'pending',
          sentBy: sentBy
        });
        notificationRecords.push(notificationRecord);
      }

      // Send notification via topic
      const topicResult = await this.sendToTopic('all_users', title, body, {
        type: 'admin_notification',
        ...data
      });

      // Update notification records based on topic result
      const updateStatus = topicResult.success ? 'sent' : 'failed';
      const updateData = {
        status: updateStatus,
        sentAt: topicResult.success ? new Date() : null,
        fcmMessageId: topicResult.success ? topicResult.messageId : null,
        errorMessage: topicResult.success ? null : topicResult.error
      };

      // Update all notification records
      for (const notificationRecord of notificationRecords) {
        await notificationRecord.update(updateData);
      }

      console.log(`Admin notification sent to ${users.length} users, topic result:`, topicResult);
      
      return {
        success: topicResult.success,
        messageId: topicResult.messageId,
        totalUsers: users.length,
        notificationIds: notificationRecords.map(n => n.id),
        error: topicResult.error
      };
    } catch (error) {
      console.error('Error sending admin notification:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new NotificationService(); 