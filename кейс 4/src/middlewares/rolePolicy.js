import { ForbiddenError } from '../errors/AppError.js';
export const readAccess = (req, res, next) => req.user ? next() : next(new ForbiddenError());
export const writeAccess = (req, res, next) => ['technician', 'admin'].includes(req.user?.role) ? next() : next(new ForbiddenError());
export const adminAccess = (req, res, next) => req.user?.role === 'admin' ? next() : next(new ForbiddenError());
