import { DataTypes } from '../config/database.js';
import sequelize from '../config/database.js';

const PolicyVersion = sequelize.define('PolicyVersion', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  policy_type: {
    type: DataTypes.ENUM('terms', 'privacy', 'returns', 'shipping'),
    allowNull: false
  },
  version_number: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  effective_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'policy_versions'
});

export default PolicyVersion;

