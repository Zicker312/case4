import { EquipmentPassport, Site } from '../models/index.js';
import { sequelize } from '../db.js';
import { equipmentRepository, requestRepository } from '../repositories/index.js';
import { ConflictError, NotFoundError } from '../errors/AppError.js';

export async function listEquipment(query) { return equipmentRepository.findAll(query); }
export async function getEquipment(id) { const item = await equipmentRepository.findById(id); if (!item) throw new NotFoundError('Оборудование не найдено'); return item; }

export async function createEquipment(data) {
  const site = data.siteId ? await Site.findByPk(data.siteId) : await Site.findOne({ order: [['code', 'ASC']] });
  if (!site) throw new NotFoundError('Площадка не найдена');
  const exists = await (await import('../models/index.js')).Equipment.findOne({ where: { serialNumber: data.serialNumber }, attributes: ['id'] });
  if (exists) throw new ConflictError('Серийный номер уже используется');
  const now = new Date();
  const item = await equipmentRepository.create({
    siteId: site.id, name: data.name, type: data.type, serialNumber: data.serialNumber,
    status: data.status || 'operational', locationLat: data.location.lat, locationLon: data.location.lon,
    installedAt: data.installedAt, createdAt: now, updatedAt: now
  });
  if (data.passport) await EquipmentPassport.create({ equipmentId: item.id, ...data.passport });
  return getEquipment(item.id);
}
export async function updateEquipment(id, data) {
  await getEquipment(id);
  if (data.siteId) { const site = await Site.findByPk(data.siteId); if (!site) throw new NotFoundError('Площадка не найдена'); }
  const patch = {};
  for (const key of ['siteId', 'name', 'type', 'serialNumber', 'status', 'installedAt']) if (data[key] !== undefined) patch[key] = data[key];
  if (data.location) { patch.locationLat = data.location.lat; patch.locationLon = data.location.lon; }
  patch.updatedAt = new Date();
  return equipmentRepository.update(id, patch);
}
export async function deleteEquipment(id) {
  await getEquipment(id);
  const { MaintenanceRequest } = await import('../models/index.js');
  const open = await MaintenanceRequest.count({ where: { equipmentId: id, status: ['new', 'in_progress'] } });
  if (open) throw new ConflictError('Нельзя удалить оборудование с открытой заявкой');
  await equipmentRepository.remove(id);
}
export async function equipmentRequests(id, query) { await getEquipment(id); return equipmentRepository.findRequests(id, query); }
export async function weatherLocation(id) { const item = await getEquipment(id); return { lat: Number(item.locationLat), lon: Number(item.locationLon) }; }
