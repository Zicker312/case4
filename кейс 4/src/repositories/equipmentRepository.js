import { Op } from 'sequelize';
import { Equipment, EquipmentPassport, MaintenanceRequest, Site } from '../models/index.js';

const equipmentAttributes = ['id', 'siteId', 'name', 'type', 'serialNumber', 'status', 'locationLat', 'locationLon', 'installedAt', 'createdAt', 'updatedAt'];

export async function findAll(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.siteId) where.siteId = query.siteId;
  const allowedSort = { name: 'name', installedAt: 'installedAt', status: 'status', createdAt: 'createdAt' };
  const sort = allowedSort[query.sort] || 'name';
  const direction = query.order === 'desc' ? 'DESC' : 'ASC';
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(query.limit) || 10));
  const { rows, count } = await Equipment.findAndCountAll({
    where,
    attributes: equipmentAttributes,
    include: [
      { model: Site, as: 'site', attributes: ['id', 'name', 'code', 'region', 'latitude', 'longitude'] },
      { model: EquipmentPassport, as: 'passport', attributes: ['id', 'manufacturer', 'model', 'ratedPower', 'lastCalibrationAt'] }
    ],
    order: [[sort, direction]], limit, offset: (page - 1) * limit, distinct: true
  });
  return { data: rows, total: count, page, limit };
}

export async function findById(id) {
  return Equipment.findByPk(id, {
    attributes: equipmentAttributes,
    include: [
      { model: Site, as: 'site', attributes: ['id', 'name', 'code', 'region', 'latitude', 'longitude'] },
      { model: EquipmentPassport, as: 'passport', attributes: ['id', 'manufacturer', 'model', 'ratedPower', 'lastCalibrationAt'] }
    ]
  });
}

export async function create(data) { return Equipment.create(data); }
export async function update(id, data) { const [n] = await Equipment.update(data, { where: { id } }); return n ? findById(id) : null; }
export async function remove(id) { return Equipment.destroy({ where: { id } }); }

export async function findRequests(id, query = {}) {
  const where = { equipmentId: id };
  if (query.status) where.status = query.status;
  return MaintenanceRequest.findAll({
    where,
    attributes: ['id', 'equipmentId', 'title', 'description', 'priority', 'status', 'plannedAt', 'author', 'createdAt', 'updatedAt'],
    order: [['createdAt', 'DESC']]
  });
}
