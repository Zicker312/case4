import crypto from 'node:crypto';
export function requestId(req, res, next) { req.requestId = req.get('X-Request-Id') || crypto.randomUUID(); res.setHeader('X-Request-Id', req.requestId); next(); }
