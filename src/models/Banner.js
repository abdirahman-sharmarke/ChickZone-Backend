module.exports = (sequelize, DataTypes) => {
  const Banner = sequelize.define('Banner', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        len: [2, 100],
        notEmpty: true
      }
    },
    subtitle: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { 
        len: [0, 255]
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      validate: { 
        len: [0, 500]
      }
    },
    image: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { 
        notEmpty: true
      }
    },
    buttonText: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { 
        len: [0, 50]
      }
    },
    buttonLink: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: { 
        len: [0, 255]
      }
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
    }
  }, {
    tableName: 'banners',
    timestamps: true,
    indexes: [
      { fields: ['isActive'] },
      { fields: ['displayOrder'] },
      { fields: ['isActive', 'displayOrder'] }
    ]
  });

  return Banner;
}; 