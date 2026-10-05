import { config } from '../config/index.js';
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
function write(level, data) { if ((levels[level] ?? 2) <= (levels[config.logLevel] ?? 2)) process.stdout.write(JSON.stringify({ time: new Date().toISOString(), level, ...data }) + '\n'); }
export const log = { info: data => write('info', data), warn: data => write('warn', data), error: data => write('error', data), debug: data => write('debug', data) };
export function logger(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => log.info({ type: 'http', requestId: req.requestId, method: req.method, path: req.originalUrl, status: res.statusCode, durationMs: Number(process.hrtime.bigint() - start) / 1e6, ip: req.ip }));
  next();
}
