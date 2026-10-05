export const STATUS_TRANSITIONS = {
  new: ['in_progress', 'rejected'],
  in_progress: ['done', 'rejected'],
  done: [],
  rejected: []
};
export const ROLES = ['viewer', 'technician', 'admin'];
export const canRead = role => ROLES.includes(role);
export const canWrite = role => role === 'technician' || role === 'admin';
export const canAdmin = role => role === 'admin';
export function canTransition(from, to) { return STATUS_TRANSITIONS[from]?.includes(to) ?? false; }
export function validateBrigade(assignees) {
  if (!Array.isArray(assignees) || assignees.length === 0) return { ok: false, message: 'Бригада не может быть пустой' };
  const ids = assignees.map(x => x.technicianId);
  if (new Set(ids).size !== ids.length) return { ok: false, message: 'Специалист повторяется в бригаде' };
  if (assignees.filter(x => x.role === 'lead').length !== 1) return { ok: false, message: 'Должен быть ровно один lead' };
  if (assignees.some(x => !['lead', 'member'].includes(x.role))) return { ok: false, message: 'Недопустимая роль специалиста' };
  return { ok: true };
}
