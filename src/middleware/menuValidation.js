const { body, param } = require('express-validator');

const validateCreateMenu = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required'),
  
  body('description')
    .optional()
    .trim(),
  
  body('price')
    .notEmpty()
    .withMessage('Price is required'),
  
  body('available')
    .optional(),
  
  body('discount')
    .optional()
];

const validateUpdateMenu = [
  body('name')
    .optional()
    .trim(),
  
  body('description')
    .optional()
    .trim(),
  
  body('price')
    .optional(),
  
  body('available')
    .optional(),
  
  body('discount')
    .optional()
];

const validateMenuId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Menu ID must be a positive integer')
];

module.exports = {
  validateCreateMenu,
  validateUpdateMenu,
  validateMenuId
}; 