import { sequelize } from '../db.js';
import { siteRepository } from '../repositories/index.js';
import { NotFoundError } from '../errors/AppError.js';

export async function summary(siteId) {
  const site = await siteRepository.findById(siteId);
  if (!site) throw new NotFoundError('Площадка не найдена');
  const [rows] = await sequelize.query(`
    SELECT r.status, r.priority, COUNT(*)::int AS count,
           AVG(EXTRACT(EPOCH FROM (r.updated_at - r.created_at)) / 3600) FILTER (WHERE r.status = 'done') AS "avgCloseHours"
    FROM maintenance_requests r
    JOIN equipment e ON e.id = r.equipment_id
    WHERE e.site_id = :siteId
    GROUP BY r.status, r.priority
    ORDER BY r.status, r.priority
  `, { replacements: { siteId } });
  const [avgRows] = await sequelize.query(`
    SELECT AVG(EXTRACT(EPOCH FROM (r.updated_at - r.created_at)) / 3600) AS "avgCloseHours"
    FROM maintenance_requests r
    JOIN equipment e ON e.id = r.equipment_id
    WHERE e.site_id = :siteId AND r.status = 'done'
  `, { replacements: { siteId } });
  return { site, byStatusAndPriority: rows, averageCloseHours: Number(avgRows[0]?.avgCloseHours || 0) };
}
