export class AppError extends Error {
  constructor(status, code, message, details = []) { super(message); this.status = status; this.code = code; this.details = details; }
}
export class ValidationError extends AppError { constructor(details = [], message = 'Ошибка валидации') { super(422, 'VALIDATION_ERROR', message, details); } }
export class BadRequestError extends AppError { constructor(message = 'Некорректный запрос') { super(400, 'BAD_REQUEST', message); } }
export class NotFoundError extends AppError { constructor(message = 'Запись не найдена') { super(404, 'NOT_FOUND', message); } }
export class ConflictError extends AppError { constructor(message = 'Конфликт данных') { super(409, 'CONFLICT', message); } }
export class UnauthorizedError extends AppError { constructor(message = 'Требуется авторизация') { super(401, 'UNAUTHORIZED', message); } }
export class ForbiddenError extends AppError { constructor(message = 'Недостаточно прав') { super(403, 'FORBIDDEN', message); } }
