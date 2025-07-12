const { body, param } = require('express-validator');

const validateCreateOrder = [
  body('items')
    .notEmpty()
    .withMessage('Items are required'),
  
  body('items.*.menuId')
    .optional(),
  
  body('items.*.quantity')
    .optional(),
  
  body('items.*.notes')
    .optional()
    .trim()
];

const validateUpdateStatus = [
  body('status')
    .notEmpty()
    .withMessage('Status is required')
];

const validateOrderId = [
  param('id')
    .notEmpty()
    .withMessage('Order ID is required')
];

module.exports = {
  validateCreateOrder,
  validateUpdateStatus,
  validateOrderId
}; 