module.exports = (sequelize, DataTypes) => {
  const Menu = sequelize.define('Menu', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        len: [2, 100],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { 
        len: [10, 500],
        notEmpty: true
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: { 
        min: 0.01,
        isDecimal: true
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    discount: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: true,
      validate: { 
        min: 0,
        max: 100
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      }
    }
  }, {
    tableName: 'menus',
    timestamps: true,
    indexes: [
      { fields: ['available'] },
      { fields: ['price'] },
      { fields: ['name'] }
    ]
  });

  // Instance method to calculate discounted price
  Menu.prototype.getDiscountedPrice = function() {
    if (this.discount && this.discount > 0) {
      return (this.price * (1 - this.discount / 100)).toFixed(2);
    }
    return this.price;
  };

  // Add association method
  Menu.associate = function(models) {
    Menu.belongsTo(models.Category, {
      foreignKey: 'categoryId',
      as: 'category'
    });
  };

  return Menu;
}; 