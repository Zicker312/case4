import { AppError } from '../errors/AppError.js';
import { log } from './logger.js';
export function notFound(req, res) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Маршрут не найден', details: [], requestId: req.requestId } }); }
export function errorHandler(err, req, res, next) {
  let error = err;
  if (err?.name === 'SequelizeUniqueConstraintError') error = new AppError(409, 'CONFLICT', 'Нарушено уникальное ограничение БД');
  else if (err?.name === 'SequelizeForeignKeyConstraintError') error = new AppError(404, 'NOT_FOUND', 'Связанная запись не найдена');
  else if (err?.name === 'SequelizeValidationError') error = new AppError(422, 'VALIDATION_ERROR', 'Ошибка валидации данных', err.errors?.map(x => ({ field: x.path, message: x.message })) || []);
  else if (err?.name === 'SequelizeDatabaseError') error = new AppError(400, 'DATABASE_ERROR', 'Ошибка базы данных');
  const status = error instanceof AppError ? error.status : 500;
  if (!(error instanceof AppError)) log.error({ type: 'error', requestId: req.requestId, message: err?.message, stack: err?.stack });
  res.status(status).json({ error: { code: error.code || 'INTERNAL_ERROR', message: error.message || 'Внутренняя ошибка', details: error.details || [], requestId: req.requestId } });
}
