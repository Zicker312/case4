import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError.js';
export function authenticate(req, res, next) {
  try {
    const header = req.get('Authorization') || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedError();
    req.user = jwt.verify(token, config.jwtSecret);
    next();
  } catch (error) { next(error instanceof UnauthorizedError ? error : new UnauthorizedError()); }
}
export const requireRole = (...roles) => (req, res, next) => roles.includes(req.user?.role) ? next() : next(new ForbiddenError());
