import { DataTypes } from '../config/database.js';
import sequelize from '../config/database.js';

const SiteSetting = sequelize.define('SiteSetting', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  setting_key: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  setting_value: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  setting_type: {
    type: DataTypes.STRING(50),
    defaultValue: 'text'
  },
  updated_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id'
    }
  }
}, {
  tableName: 'site_settings',
  timestamps: true,
  underscored: true
});

export default SiteSetting;

