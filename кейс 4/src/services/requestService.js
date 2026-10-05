import { sequelize } from '../db.js';
import { MaintenanceRequest, RequestAssignee } from '../models/index.js';
import { requestRepository, equipmentRepository } from '../repositories/index.js';
import { ConflictError, NotFoundError, ValidationError, ForbiddenError } from '../errors/AppError.js';
import { canTransition, validateBrigade } from '../domain/policies.js';

export async function listRequests(query) { return requestRepository.findAll(query); }
export async function getRequest(id) { const item = await requestRepository.findById(id); if (!item) throw new NotFoundError('Заявка не найдена'); return item; }
export async function createRequest(data, actor) {
  if (!await equipmentRepository.findById(data.equipmentId)) throw new NotFoundError('Оборудование не найдено');
  const now = new Date(); return requestRepository.create({ ...data, status: 'new', author: actor?.email || data.author || null, createdAt: now, updatedAt: now });
}
export async function updateRequest(id, data, actor) {
  const old = await getRequest(id);
  if (data.status && data.status !== old.status) throw new ConflictError('Для смены статуса используйте отдельный эндпоинт');
  if (actor?.role === 'technician') await ensureAssigned(id, actor.technicianId);
  const patch = { ...data, updatedAt: new Date() }; delete patch.equipmentId;
  return requestRepository.update(id, patch);
}
async function ensureAssigned(requestId, technicianId, transaction) {
  if (!technicianId) throw new ForbiddenError('У пользователя technician не указан специалист');
  const found = await RequestAssignee.findOne({ where: { requestId, technicianId }, transaction });
  if (!found) throw new ForbiddenError('Вы можете менять только назначенные вам заявки');
}
export async function changeStatus(id, newStatus, actor) {
  return sequelize.transaction(async transaction => {
    const item = await MaintenanceRequest.findByPk(id, { transaction });
    if (!item) throw new NotFoundError('Заявка не найдена');
    if (actor?.role === 'technician') await ensureAssigned(id, actor.technicianId, transaction);
    if (!canTransition(item.status, newStatus)) throw new ConflictError(`Переход ${item.status} → ${newStatus} запрещён`);
    if (newStatus === 'in_progress') {
      const count = await RequestAssignee.count({ where: { requestId: id }, transaction });
      if (!count) throw new ConflictError('Нельзя перевести заявку в работу без назначенных исполнителей');
    }
    const oldStatus = item.status; item.status = newStatus; item.updatedAt = new Date(); await item.save({ transaction });
    await requestRepository.addHistory({ requestId: id, oldStatus, newStatus, author: actor?.email || 'operator', comment: 'Изменение статуса через API', createdAt: new Date() }, transaction);
    return requestRepository.findById(id, { transaction });
  });
}
export async function deleteRequest(id) { await getRequest(id); await requestRepository.remove(id); }
export async function replaceAssignees(requestId, assignees) {
  const policy = validateBrigade(assignees); if (!policy.ok) { if (policy.message.includes('повторяется')) throw new ConflictError(policy.message); throw new ValidationError([{ field: 'assignees', message: policy.message }]); }
  return sequelize.transaction(async transaction => {
    const request = await MaintenanceRequest.findByPk(requestId, { transaction }); if (!request) throw new NotFoundError('Заявка не найдена');
    const found = await requestRepository.findTechnicians(assignees.map(x => x.technicianId), transaction);
    if (found.length !== new Set(assignees.map(x => x.technicianId)).size) throw new NotFoundError('Один или несколько специалистов не найдены');
    await requestRepository.replaceAssignees(requestId, assignees, transaction); return requestRepository.findAssignees(requestId, transaction);
  });
}
export async function removeAssignee(requestId, technicianId) { const count = await RequestAssignee.destroy({ where: { requestId, technicianId } }); if (!count) throw new NotFoundError('Назначение не найдено'); }
export async function getHistory(requestId) { await getRequest(requestId); return requestRepository.history(requestId); }
export async function equipmentLoad(query = {}) {
  const minRequests = Math.max(0, Number(query.minRequests || 0)); const from = query.from ? new Date(query.from) : null; const to = query.to ? new Date(query.to) : null; const replacements = { minRequests }; const period = [];
  if (from && !Number.isNaN(from.getTime())) { period.push('r.created_at >= :from'); replacements.from = from; } if (to && !Number.isNaN(to.getTime())) { period.push('r.created_at <= :to'); replacements.to = to; }
  const where = period.length ? `WHERE ${period.join(' AND ')}` : '';
  const [rows] = await sequelize.query(`SELECT e.id,e.name,e.serial_number AS "serialNumber",COUNT(DISTINCT r.id)::int AS "requestCount",COUNT(DISTINCT r.id) FILTER (WHERE r.status='done')::int AS "closedCount",COALESCE(SUM(ra.hours),0)::numeric AS "plannedHours",MAX(r.updated_at) FILTER (WHERE r.status='done') AS "lastServiceAt" FROM equipment e LEFT JOIN maintenance_requests r ON r.equipment_id=e.id LEFT JOIN request_assignees ra ON ra.request_id=r.id ${where} GROUP BY e.id,e.name,e.serial_number HAVING COUNT(DISTINCT r.id)>=:minRequests ORDER BY "requestCount" DESC,e.name ASC`, { replacements });
  return rows;
}
