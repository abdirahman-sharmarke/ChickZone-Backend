# ChickZone Firebase Push Notification Guide

## Overview
This guide explains how to use the Firebase push notification system in ChickZone backend. The system supports both automatic and manual notifications.

## Features

### 1. Automatic Notifications
- **New Order Notification**: Sent when a customer places a new order
- **Order Status Updates**: Sent when order status changes (confirmed, preparing, ready, etc.)
- **Order Ready Notification**: Special notification when order is ready for pickup

### 2. Manual Notifications
- **Send to specific user**: Admin can send notifications to individual users
- **Send to multiple users**: Admin can send notifications to selected users
- **Send to all users**: Admin can broadcast notifications to all registered users

### 3. Notification History
- **Complete History**: All notifications are stored in the database
- **User Notifications**: Users can view their notification history
- **Read Status**: Track read/unread notifications
- **Admin Dashboard**: Admin can view all notifications and statistics
- **Filtering**: Filter notifications by status, type, user, etc.

## API Endpoints

### User Endpoints

#### Update FCM Token
```
POST /api/notifications/fcm-token
Authorization: Bearer <token>
Content-Type: application/json

{
  "token": "fcm_device_token_here"
}
```

#### Test Notification
```
POST /api/notifications/test
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Test Title (optional)",
  "body": "Test Body (optional)"
}
```

#### Get User's Notifications
```
GET /api/notifications/my-notifications?page=1&limit=20&isRead=false&type=order_confirmed
Authorization: Bearer <token>
```

#### Mark Notification as Read
```
PUT /api/notifications/mark-read/{notificationId}
Authorization: Bearer <token>
```

#### Mark All Notifications as Read
```
PUT /api/notifications/mark-all-read
Authorization: Bearer <token>
```

### Admin Endpoints

#### Send Notification to Specific User
```
POST /api/notifications/send-to-user
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userId": 1,
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "key": "value"
  }
}
```

#### Send Notification to Multiple Users
```
POST /api/notifications/send-to-users
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "userIds": [1, 2, 3],
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "key": "value"
  }
}
```

#### Send Notification to All Users
```
POST /api/notifications/send-to-all
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Notification Title",
  "body": "Notification Body",
  "data": {
    "key": "value"
  }
}
```

#### Get All Users
```
GET /api/notifications/users
Authorization: Bearer <admin_token>
```

#### Get Users by Role
```
GET /api/notifications/users/customer
GET /api/notifications/users/admin
Authorization: Bearer <admin_token>
```

#### Get All Notifications (Admin)
```
GET /api/notifications/all?page=1&limit=20&status=sent&type=order_confirmed&userId=123
Authorization: Bearer <admin_token>
```

#### Get Notification Statistics (Admin)
```
GET /api/notifications/stats
Authorization: Bearer <admin_token>
```

#### Delete Notification (Admin)
```
DELETE /api/notifications/{notificationId}
Authorization: Bearer <admin_token>
```

## Automatic Notification Flow

### 1. New Order Created
When a customer creates a new order:
- Automatic notification sent to the customer
- Title: "🎉 Order Confirmed!"
- Body: "Your order #[ID] has been confirmed. Total: $[AMOUNT]"

### 2. Order Status Updates
When admin updates order status:
- Automatic notification sent to the customer
- Different messages based on status:
  - `pending`: "Order received and pending confirmation"
  - `confirmed`: "Order confirmed and being prepared"
  - `preparing`: "Your order is being prepared"
  - `ready`: "Your order is ready for pickup!" (Special notification)
  - `delivered`: "Order delivered successfully"
  - `cancelled`: "Order has been cancelled"

## Database Schema Updates

The User model has been updated to include:
```javascript
fcmToken: {
  type: DataTypes.STRING,
  allowNull: true
}
```

## Setup Instructions

### 1. Firebase Configuration
- Place your Firebase service account key in `src/config/firebase-service-account.json`
- The file is already added to `.gitignore` for security

### 2. Client-Side Integration
Your mobile app should:
1. Register for FCM notifications
2. Send the FCM token to the server using the `/api/notifications/fcm-token` endpoint
3. Handle incoming notifications

### 3. Testing
Use the test notification endpoint to verify the setup:
```bash
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "body": "Hello from ChickZone!"}'
```

## Error Handling

The notification system is designed to be non-blocking:
- If a notification fails to send, it logs the error but doesn't affect the main operation
- Order creation and status updates will continue to work even if notifications fail

## Security

- All notification endpoints require authentication
- Admin-only endpoints require admin role
- FCM tokens are stored securely in the database
- Firebase service account key is excluded from version control

## Notification Types

The system sends structured data with each notification:

### Order Confirmation
```json
{
  "type": "order_confirmed",
  "orderId": "123",
  "totalPrice": "25.99",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Order Ready
```json
{
  "type": "order_ready",
  "orderId": "123",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Order Update
```json
{
  "type": "order_update",
  "orderId": "123",
  "status": "preparing",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Admin Notification
```json
{
  "type": "admin_notification",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Best Practices

1. **Always send FCM token** when user logs in
2. **Handle notification permissions** properly in your mobile app
3. **Test notifications** before deploying to production
4. **Monitor notification delivery** through Firebase Console
5. **Keep notification messages concise** and user-friendly

## Troubleshooting

### Common Issues

1. **Notification not received**
   - Check if FCM token is registered for the user
   - Verify Firebase service account key is correct
   - Check if the app has notification permissions

2. **Invalid FCM token**
   - Tokens can expire or become invalid
   - Implement token refresh logic in your app

3. **Admin endpoints not working**
   - Ensure user has admin role
   - Check JWT token validity

### Debug Mode

Enable debug logging by setting appropriate log levels in your application to see detailed notification sending logs.

## API Response Examples

### Get User's Notifications Response
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "title": "🎉 Order Confirmed!",
        "body": "Your order #123 has been confirmed. Total: $25.99",
        "type": "order_confirmed",
        "data": {
          "orderId": "123",
          "totalPrice": "25.99"
        },
        "status": "sent",
        "isRead": false,
        "sentAt": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "sender": {
          "id": null,
          "fullName": null,
          "email": null
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

### Notification Statistics Response
```json
{
  "success": true,
  "data": {
    "totalNotifications": 150,
    "sentNotifications": 145,
    "failedNotifications": 3,
    "pendingNotifications": 2,
    "notificationsByType": [
      {
        "type": "order_confirmed",
        "count": 45
      },
      {
        "type": "order_ready",
        "count": 40
      },
      {
        "type": "admin_notification",
        "count": 10
      }
    ],
    "recentNotifications": [...]
  }
}
``` 