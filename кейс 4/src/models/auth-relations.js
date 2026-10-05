import { User, RefreshSession, Technician } from './index.js';
User.belongsTo(Technician, { foreignKey: 'technicianId', as: 'technician' });
Technician.hasOne(User, { foreignKey: 'technicianId', as: 'user' });
RefreshSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
User.hasMany(RefreshSession, { foreignKey: 'userId', as: 'refreshSessions' });
