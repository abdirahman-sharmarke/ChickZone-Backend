require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const db = require('./src/models');
const userRoutes = require('./src/routes/userRoutes');
const menuRoutes = require('./src/routes/menuRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const bannerRoutes = require('./src/routes/bannerRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const notificationRoutes = require('./src/routes/notificationRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Error handling for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  // Don't exit the process, just log the error
});

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  // Don't exit the process, just log the error
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:3000', 'http://172.16.0.72', 'http://172.16.0.72:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api', menuRoutes);
app.use('/api', orderRoutes);
app.use('/api', bannerRoutes);
app.use('/api', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/uploads', express.static('uploads'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'ChickZone API is running!' });
});

console.log('Welcome to ChickZone! 🐣');

async function startServer() {
  try {
    await db.sequelize.authenticate();
    console.log('✅ Database connection established successfully.');

    await db.sequelize.sync();
    console.log('✅ Database synchronized successfully.');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 ChickZone server running on port ${PORT}`);
      console.log(`✨ API endpoints available at:`);
      console.log(`   - http://localhost:${PORT}/api`);
      console.log(`   - http://172.16.0.72:${PORT}/api`);
    });

    // Handle server errors
    server.on('error', (error) => {
      console.error('❌ Server error:', error);
    });

  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1); 
  }
}

startServer();

// Keep the process alive
setInterval(() => {
  // This is a heartbeat to keep the process running
}, 60000); // Every minute
