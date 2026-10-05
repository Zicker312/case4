import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const User = sequelize.define('User', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false, field: 'password_hash' },
  role: { type: DataTypes.ENUM('viewer', 'technician', 'admin'), allowNull: false, defaultValue: 'viewer' },
  technicianId: { type: DataTypes.UUID, allowNull: true, field: 'technician_id' },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' },
  updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' }
}, { tableName: 'users', timestamps: false });

export const RefreshSession = sequelize.define('RefreshSession', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  userId: { type: DataTypes.UUID, allowNull: false, field: 'user_id' },
  tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true, field: 'token_hash' },
  expiresAt: { type: DataTypes.DATE, allowNull: false, field: 'expires_at' },
  revokedAt: { type: DataTypes.DATE, allowNull: true, field: 'revoked_at' },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' }
}, { tableName: 'refresh_sessions', timestamps: false });

export const ApiRequestMetric = sequelize.define('ApiRequestMetric', {
  id: { type: DataTypes.BIGINT, autoIncrement: true, primaryKey: true },
  requestId: { type: DataTypes.STRING(80), allowNull: false, field: 'request_id' },
  method: { type: DataTypes.STRING(10), allowNull: false },
  route: { type: DataTypes.STRING(255), allowNull: false },
  statusCode: { type: DataTypes.INTEGER, allowNull: false, field: 'status_code' },
  durationMs: { type: DataTypes.DECIMAL(12, 3), allowNull: false, field: 'duration_ms' },
  createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' }
}, { tableName: 'api_request_metrics', timestamps: false });
