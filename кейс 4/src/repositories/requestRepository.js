import { MaintenanceRequest, Equipment, EquipmentPassport, Site, Technician, RequestAssignee, RequestStatusHistory } from '../models/index.js';

const requestAttributes = ['id', 'equipmentId', 'title', 'description', 'priority', 'status', 'plannedAt', 'author', 'createdAt', 'updatedAt'];
const includes = [
  { model: Equipment, as: 'equipment', attributes: ['id', 'siteId', 'name', 'type', 'serialNumber', 'status', 'locationLat', 'locationLon', 'installedAt'], include: [
    { model: Site, as: 'site', attributes: ['id', 'name', 'code', 'region'] },
    { model: EquipmentPassport, as: 'passport', attributes: ['id', 'manufacturer', 'model', 'ratedPower', 'lastCalibrationAt'] }
  ] },
  { model: Technician, as: 'assignees', attributes: ['id', 'fullName', 'specialization', 'employeeNumber'], through: { attributes: ['role', 'hours'] } }
];

export async function findAll(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.priority) where.priority = query.priority;
  if (query.equipmentId) where.equipmentId = query.equipmentId;
  const allowedSort = { createdAt: 'created_at', updatedAt: 'updated_at', priority: 'priority', status: 'status', plannedAt: 'planned_at' };
  const sort = allowedSort[query.sort] || 'created_at';
  const direction = query.order === 'asc' ? 'ASC' : 'DESC';
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const { rows, count } = await MaintenanceRequest.findAndCountAll({ where, attributes: requestAttributes, include: includes, order: [[sort, direction]], limit, offset: (page - 1) * limit, distinct: true });
  return { data: rows, total: count, page, limit };
}

export async function findById(id, options = {}) {
  return MaintenanceRequest.findByPk(id, { attributes: requestAttributes, include: includes, ...options });
}

export async function create(data, options = {}) { return MaintenanceRequest.create(data, options); }
export async function update(id, data, options = {}) { const [n] = await MaintenanceRequest.update(data, { where: { id }, ...options }); return n ? findById(id, options) : null; }
export async function remove(id) { return MaintenanceRequest.destroy({ where: { id } }); }

export async function findAssignees(requestId, transaction) {
  return RequestAssignee.findAll({ where: { requestId }, include: [{ model: Technician, as: 'technician', attributes: ['id', 'fullName', 'specialization', 'employeeNumber'] }], transaction });
}
export async function replaceAssignees(requestId, rows, transaction) {
  await RequestAssignee.destroy({ where: { requestId }, transaction });
  if (rows.length) await RequestAssignee.bulkCreate(rows.map(x => ({ requestId, technicianId: x.technicianId, role: x.role, hours: x.hours })), { transaction });
}
export async function findTechnicians(ids, transaction) { return Technician.findAll({ where: { id: ids }, attributes: ['id'], transaction }); }
export async function history(requestId) { return RequestStatusHistory.findAll({ where: { requestId }, attributes: ['id', 'oldStatus', 'newStatus', 'author', 'comment', 'createdAt'], order: [['createdAt', 'ASC']] }); }
export async function addHistory(data, transaction) { return RequestStatusHistory.create(data, { transaction }); }
export { MaintenanceRequest };
