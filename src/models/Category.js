module.exports = (sequelize, DataTypes) => {
  const Category = sequelize.define('Category', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: { 
        len: [2, 50],
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { 
        len: [0, 300]
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    displayOrder: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: { 
        min: 0
      }
    },
    color: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        is: /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/i // Hex color validation
      }
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { 
        len: [0, 100]
      }
    }
  }, {
    tableName: 'categories',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['displayOrder'] },
      { fields: ['name'] },
      { fields: ['isActive', 'displayOrder'] }
    ]
  });

  // Add association method
  Category.associate = function(models) {
    Category.hasMany(models.Menu, {
      foreignKey: 'categoryId',
      as: 'menuItems'
    });
  };

  return Category;
}; 