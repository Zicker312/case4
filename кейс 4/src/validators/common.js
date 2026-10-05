import { ValidationError, BadRequestError } from '../errors/AppError.js';
const types = ['turbine', 'inverter', 'sensor', 'substation'];
const equipmentStatuses = ['operational', 'maintenance', 'fault', 'decommissioned'];
const priorities = ['low', 'medium', 'high', 'critical'];
const requestStatuses = ['new', 'in_progress', 'done', 'rejected'];
const clean = (body, allowed) => Object.fromEntries(Object.entries(body || {}).filter(([key]) => allowed.includes(key)));
function details(list) { if (list.length) throw new ValidationError(list); }
function validDate(value) { const d = new Date(value); return !Number.isNaN(d.getTime()); }
function pagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 10 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) throw new BadRequestError('page должен быть целым числом от 1');
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new BadRequestError('limit должен быть целым числом от 1 до 50');
}
export function validateEquipmentBody(body = {}, partial = false) {
  const errors = []; const allowed = ['siteId', 'name', 'type', 'serialNumber', 'location', 'status', 'installedAt', 'passport'];
  if (!partial || body.name !== undefined) if (typeof body.name !== 'string' || body.name.length < 3 || body.name.length > 100) errors.push({ field: 'name', message: 'От 3 до 100 символов' });
  if (!partial || body.type !== undefined) if (!types.includes(body.type)) errors.push({ field: 'type', message: 'Недопустимый тип' });
  if (!partial || body.serialNumber !== undefined) if (typeof body.serialNumber !== 'string' || !body.serialNumber.trim()) errors.push({ field: 'serialNumber', message: 'Поле обязательно' });
  if (!partial || body.location !== undefined) if (!body.location || typeof body.location.lat !== 'number' || typeof body.location.lon !== 'number') errors.push({ field: 'location', message: 'Нужны числовые lat и lon' });
  if (body.status !== undefined && !equipmentStatuses.includes(body.status)) errors.push({ field: 'status', message: 'Недопустимый статус' });
  if (!partial || body.installedAt !== undefined) if (!validDate(body.installedAt) || new Date(body.installedAt) > new Date()) errors.push({ field: 'installedAt', message: 'Нужна корректная дата не из будущего' });
  if (body.siteId !== undefined && typeof body.siteId !== 'string') errors.push({ field: 'siteId', message: 'Некорректный siteId' });
  details(errors); return clean(body, allowed);
}
export function validateRequestBody(body = {}, partial = false) {
  const errors = []; const allowed = ['equipmentId', 'title', 'description', 'priority', 'status', 'plannedAt', 'author'];
  if (!partial || body.equipmentId !== undefined) if (typeof body.equipmentId !== 'string' || !body.equipmentId.trim()) errors.push({ field: 'equipmentId', message: 'Нужен equipmentId' });
  if (!partial || body.title !== undefined) if (typeof body.title !== 'string' || body.title.length < 5 || body.title.length > 120) errors.push({ field: 'title', message: 'От 5 до 120 символов' });
  if (body.description !== undefined && typeof body.description !== 'string') errors.push({ field: 'description', message: 'Должно быть строкой' });
  if (body.description && body.description.length > 2000) errors.push({ field: 'description', message: 'Максимум 2000 символов' });
  if (body.priority !== undefined && !priorities.includes(body.priority)) errors.push({ field: 'priority', message: 'Недопустимый приоритет' });
  if (body.status !== undefined && !requestStatuses.includes(body.status)) errors.push({ field: 'status', message: 'Недопустимый статус' });
  if (body.plannedAt !== undefined && !validDate(body.plannedAt)) errors.push({ field: 'plannedAt', message: 'Неверная дата' });
  details(errors); return clean(body, allowed);
}
export function validateStatus(status) { if (!requestStatuses.includes(status)) throw new ValidationError([{ field: 'status', message: 'Недопустимый статус' }]); return status; }
export function validatePagination(query) { pagination(query); }
