import * as service from '../services/authService.js';
import { config } from '../config/index.js';
const cookieOptions = () => ({ httpOnly: true, secure: config.cookieSecure, sameSite: config.cookieSameSite, path: '/api/auth' });
export async function register(req, res) { res.status(201).json({ data: await service.register(req.body) }); }
export async function login(req, res) { const result = await service.login(req.body?.email, req.body?.password); res.cookie(config.refreshCookieName, result.refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 }); res.json({ data: { user: result.user, accessToken: result.accessToken } }); }
export async function refresh(req, res) { const result = await service.refresh(req.cookies?.[config.refreshCookieName]); res.cookie(config.refreshCookieName, result.refreshToken, { ...cookieOptions(), maxAge: 7 * 24 * 60 * 60 * 1000 }); res.json({ data: { user: result.user, accessToken: result.accessToken } }); }
export async function logout(req, res) { await service.logout(req.cookies?.[config.refreshCookieName]); res.clearCookie(config.refreshCookieName, cookieOptions()); res.status(204).send(); }
export async function me(req, res) { res.json({ data: await service.me(req.user.sub) }); }
