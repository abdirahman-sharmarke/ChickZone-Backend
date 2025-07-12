module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define('Order', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
        isDecimal: true
      }
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'confirmed', 
        'preparing',
        'ready',
        'delivered',
        'cancelled'
      ),
      defaultValue: 'pending'
    }
  }, {
    tableName: 'orders',
    timestamps: true,
    indexes: [
      { fields: ['userId'] },
      { fields: ['status'] },
      { fields: ['createdAt'] }
    ]
  });

  // Define associations
  Order.associate = function(models) {
    Order.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  // Instance method to calculate total from items
  Order.prototype.calculateTotal = function() {
    if (!this.items || !Array.isArray(this.items)) return 0;
    
    return this.items.reduce((total, item) => {
      const itemTotal = (item.price || 0) * (item.quantity || 0);
      const discount = item.discount || 0;
      const discountedPrice = itemTotal * (1 - discount / 100);
      return total + discountedPrice;
    }, 0).toFixed(2);
  };

  return Order;
}; 