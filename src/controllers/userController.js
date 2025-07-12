const { User } = require('../models');
const userService = require('../services/userService');
const { validationResult } = require('express-validator');

class UserController {
  // Register new user
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      // Add profile picture filename if uploaded
      if (req.file) {
        req.body.profilePicture = req.file.filename;
      }

      const user = await userService.createUser(req.body);
      const token = userService.generateToken(user.id);
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user: userService.sanitizeUser(user),
        token
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Login user
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const { user, token } = await userService.loginUser(email, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        user: userService.sanitizeUser(user),
        token
      });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  // Get user profile
  async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      res.json({
        success: true,
        user: userService.sanitizeUser(user)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Update user profile
  async updateProfile(req, res) {
    try {
      const user = await userService.updateUser(req.userId, req.body, req.file);
      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: userService.sanitizeUser(user)
      });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await User.findAll();
      res.json({
        success: true,
        users: users.map(user => userService.sanitizeUser(user))
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // Delete user (admin only)
  async deleteUser(req, res) {
    try {
      await userService.deleteUser(req.params.id);
      res.json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController(); 