import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User, RefreshSession } from '../models/index.js';
import { config } from '../config/index.js';
import { ConflictError, UnauthorizedError, ValidationError } from '../errors/AppError.js';

const publicUser = user => ({ id: user.id, email: user.email, role: user.role, technicianId: user.technicianId, createdAt: user.createdAt });
const refreshHash = token => crypto.createHash('sha256').update(token).digest('hex');
function validatePassword(password) {
  const errors = [];
  if (typeof password !== 'string' || password.length < 8) errors.push({ field: 'password', message: 'Минимум 8 символов' });
  if (!/[A-ZА-ЯЁ]/.test(password || '')) errors.push({ field: 'password', message: 'Нужна заглавная буква' });
  if (!/\d/.test(password || '')) errors.push({ field: 'password', message: 'Нужна цифра' });
  if (!/[^A-Za-zА-Яа-яЁё0-9]/.test(password || '')) errors.push({ field: 'password', message: 'Нужен специальный символ' });
  if (errors.length) throw new ValidationError(errors);
}
function signAccess(user) { return jwt.sign({ sub: user.id, email: user.email, role: user.role, technicianId: user.technicianId || null }, config.jwtSecret, { expiresIn: config.accessTokenTtl }); }
function signRefresh(user) { return jwt.sign({ sub: user.id, type: 'refresh' }, config.jwtSecret, { expiresIn: config.refreshTokenTtl }); }
export async function register({ email, password, role, technicianId }) {
  const normalized = String(email || '').trim().toLowerCase(); validatePassword(password);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) throw new ValidationError([{ field: 'email', message: 'Некорректный email' }]);
  if (role && role !== 'viewer') throw new ValidationError([{ field: 'role', message: 'Регистрация создаёт только viewer' }]);
  if (await User.findOne({ where: { email: normalized } })) throw new ConflictError('Пользователь с таким email уже существует');
  const now = new Date(); const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({ email: normalized, passwordHash, role: 'viewer', technicianId: null, createdAt: now, updatedAt: now });
  return publicUser(user);
}
export async function login(email, password) {
  const normalized = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ where: { email: normalized } });
  const valid = user ? await bcrypt.compare(String(password || ''), user.passwordHash) : false;
  if (!valid) throw new UnauthorizedError('Неверный email или пароль');
  const accessToken = signAccess(user); const refreshToken = signRefresh(user);
  const decoded = jwt.decode(refreshToken); const expiresAt = new Date(decoded.exp * 1000);
  await RefreshSession.create({ userId: user.id, tokenHash: refreshHash(refreshToken), expiresAt, createdAt: new Date() });
  return { user: publicUser(user), accessToken, refreshToken };
}
export async function refresh(refreshToken) {
  if (!refreshToken) throw new UnauthorizedError();
  let decoded; try { decoded = jwt.verify(refreshToken, config.jwtSecret); } catch { throw new UnauthorizedError(); }
  if (decoded.type !== 'refresh') throw new UnauthorizedError();
  const session = await RefreshSession.findOne({ where: { tokenHash: refreshHash(refreshToken), userId: decoded.sub, revokedAt: null } });
  if (!session || new Date(session.expiresAt) <= new Date()) throw new UnauthorizedError();
  const user = await User.findByPk(decoded.sub); if (!user) throw new UnauthorizedError();
  session.revokedAt = new Date(); await session.save();
  const nextRefresh = signRefresh(user); const nextDecoded = jwt.decode(nextRefresh);
  await RefreshSession.create({ userId: user.id, tokenHash: refreshHash(nextRefresh), expiresAt: new Date(nextDecoded.exp * 1000), createdAt: new Date() });
  return { user: publicUser(user), accessToken: signAccess(user), refreshToken: nextRefresh };
}
export async function logout(refreshToken) { if (refreshToken) await RefreshSession.update({ revokedAt: new Date() }, { where: { tokenHash: refreshHash(refreshToken), revokedAt: null } }); }
export async function me(id) { const user = await User.findByPk(id); if (!user) throw new UnauthorizedError(); return publicUser(user); }
