const { User } = require('../models');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

class UserService {
  // Create new user
  async createUser(userData) {
    const existingUser = await User.findOne({ where: { email: userData.email } });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    return await User.create(userData);
  }

  // Login user
  async loginUser(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    await user.update({ lastLogin: new Date() });

    const token = this.generateToken(user.id);
    return { user, token };
  }

  // Update user
  async updateUser(userId, updateData, profilePicture) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Handle profile picture upload
    if (profilePicture) {
      // Delete old profile picture if exists
      if (user.profilePicture) {
        const oldPath = path.join('uploads', user.profilePicture);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.profilePicture = profilePicture.filename;
    }

    return await user.update(updateData);
  }

  // Delete user
  async deleteUser(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete profile picture if exists
    if (user.profilePicture) {
      const imagePath = path.join('uploads', user.profilePicture);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await user.destroy();
  }

  // Generate JWT token
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'chickzone-secret-key',
      { expiresIn: '7d' }
    );
  }

  // Verify JWT token
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET || 'chickzone-secret-key');
  }

  // Remove sensitive data from user object
  sanitizeUser(user) {
    const { password, ...sanitizedUser } = user.toJSON();
    return sanitizedUser;
  }
}

module.exports = new UserService(); 