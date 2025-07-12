const { body, param } = require('express-validator');

const validateCreateBanner = [
  body('title')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Subtitle must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Button text must not exceed 50 characters'),
  
  body('buttonLink')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Button link must not exceed 255 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

const validateUpdateBanner = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Title must be between 2 and 100 characters'),
  
  body('subtitle')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Subtitle must not exceed 255 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  
  body('buttonText')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Button text must not exceed 50 characters'),
  
  body('buttonLink')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Button link must not exceed 255 characters'),
  
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean value'),
  
  body('displayOrder')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Display order must be a non-negative integer')
];

const validateBannerId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('Banner ID must be a positive integer')
];

module.exports = {
  validateCreateBanner,
  validateUpdateBanner,
  validateBannerId
}; 