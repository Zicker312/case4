import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

export const Site = sequelize.define('Site', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, name: { type: DataTypes.STRING(120), allowNull: false }, code: { type: DataTypes.STRING(30), allowNull: false, unique: true }, region: { type: DataTypes.STRING(100), allowNull: false }, latitude: { type: DataTypes.DECIMAL(9,6), allowNull: false }, longitude: { type: DataTypes.DECIMAL(9,6), allowNull: false }
}, { tableName: 'sites', timestamps: true, underscored: true });
export const Equipment = sequelize.define('Equipment', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, siteId: { type: DataTypes.UUID, allowNull: false, field: 'site_id' }, name: { type: DataTypes.STRING(100), allowNull: false }, type: { type: DataTypes.ENUM('turbine','inverter','sensor','substation'), allowNull: false }, serialNumber: { type: DataTypes.STRING(100), allowNull: false, unique: true, field: 'serial_number' }, status: { type: DataTypes.ENUM('operational','maintenance','fault','decommissioned'), allowNull: false, defaultValue: 'operational' }, locationLat: { type: DataTypes.DECIMAL(9,6), allowNull: false, field: 'location_lat' }, locationLon: { type: DataTypes.DECIMAL(9,6), allowNull: false, field: 'location_lon' }, installedAt: { type: DataTypes.DATE, allowNull: false, field: 'installed_at' }
}, { tableName: 'equipment', timestamps: true, underscored: true });
export const EquipmentPassport = sequelize.define('EquipmentPassport', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, equipmentId: { type: DataTypes.UUID, allowNull: false, unique: true, field: 'equipment_id' }, manufacturer: { type: DataTypes.STRING(120), allowNull: false }, model: { type: DataTypes.STRING(120), allowNull: false }, ratedPower: { type: DataTypes.DECIMAL(12,2), allowNull: false, field: 'rated_power' }, lastCalibrationAt: { type: DataTypes.DATE, allowNull: true, field: 'last_calibration_at' }
}, { tableName: 'equipment_passports', timestamps: false });
export const Technician = sequelize.define('Technician', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, fullName: { type: DataTypes.STRING(150), allowNull: false, field: 'full_name' }, specialization: { type: DataTypes.STRING(120), allowNull: false }, employeeNumber: { type: DataTypes.STRING(50), allowNull: false, unique: true, field: 'employee_number' }
}, { tableName: 'technicians', timestamps: true, underscored: true });
export const MaintenanceRequest = sequelize.define('MaintenanceRequest', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, equipmentId: { type: DataTypes.UUID, allowNull: false, field: 'equipment_id' }, title: { type: DataTypes.STRING(120), allowNull: false }, description: { type: DataTypes.TEXT }, priority: { type: DataTypes.ENUM('low','medium','high','critical'), allowNull: false, defaultValue: 'medium' }, status: { type: DataTypes.ENUM('new','in_progress','done','rejected'), allowNull: false, defaultValue: 'new' }, plannedAt: { type: DataTypes.DATE, field: 'planned_at' }, author: { type: DataTypes.STRING(120) }, createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' }, updatedAt: { type: DataTypes.DATE, allowNull: false, field: 'updated_at' }
}, { tableName: 'maintenance_requests', timestamps: false });
export const RequestStatusHistory = sequelize.define('RequestStatusHistory', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true }, requestId: { type: DataTypes.UUID, allowNull: false, field: 'request_id' }, oldStatus: { type: DataTypes.ENUM('new','in_progress','done','rejected'), field: 'old_status' }, newStatus: { type: DataTypes.ENUM('new','in_progress','done','rejected'), allowNull: false, field: 'new_status' }, author: { type: DataTypes.STRING(120) }, comment: { type: DataTypes.STRING(500) }, createdAt: { type: DataTypes.DATE, allowNull: false, field: 'created_at' }
}, { tableName: 'request_status_history', timestamps: false });
export const RequestAssignee = sequelize.define('RequestAssignee', {
  requestId: { type: DataTypes.UUID, primaryKey: true, field: 'request_id' }, technicianId: { type: DataTypes.UUID, primaryKey: true, field: 'technician_id' }, role: { type: DataTypes.ENUM('lead','member'), allowNull: false }, hours: { type: DataTypes.DECIMAL(8,2), allowNull: false, defaultValue: 1 }
}, { tableName: 'request_assignees', timestamps: false });

Site.hasMany(Equipment, { foreignKey: 'siteId', as: 'equipment' }); Equipment.belongsTo(Site, { foreignKey: 'siteId', as: 'site' });
Equipment.hasOne(EquipmentPassport, { foreignKey: 'equipmentId', as: 'passport' }); EquipmentPassport.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
Equipment.hasMany(MaintenanceRequest, { foreignKey: 'equipmentId', as: 'requests' }); MaintenanceRequest.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
MaintenanceRequest.hasMany(RequestStatusHistory, { foreignKey: 'requestId', as: 'history' }); RequestStatusHistory.belongsTo(MaintenanceRequest, { foreignKey: 'requestId', as: 'request' });
MaintenanceRequest.belongsToMany(Technician, { through: RequestAssignee, foreignKey: 'requestId', otherKey: 'technicianId', as: 'assignees' }); Technician.belongsToMany(MaintenanceRequest, { through: RequestAssignee, foreignKey: 'technicianId', otherKey: 'requestId', as: 'requests' });
RequestAssignee.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' }); RequestAssignee.belongsTo(MaintenanceRequest, { foreignKey: 'requestId', as: 'request' });

export { User, RefreshSession, ApiRequestMetric } from './auth.js';
export { sequelize };
