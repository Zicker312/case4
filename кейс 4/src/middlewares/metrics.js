import client from 'prom-client';
import { ApiRequestMetric } from '../models/auth.js';
client.collectDefaultMetrics({ prefix: 'maintenance_' });
export const httpRequestsTotal = new client.Counter({ name: 'maintenance_http_requests_total', help: 'Количество HTTP запросов', labelNames: ['method','route','status'] });
export const httpRequestDuration = new client.Histogram({ name: 'maintenance_http_request_duration_ms', help: 'Длительность HTTP запросов в миллисекундах', labelNames: ['method','route','status'], buckets: [10,25,50,100,250,500,1000,2000,5000] });
export function metricsMiddleware(req, res, next) {
  const start = process.hrtime.bigint();
  res.on('finish', () => {
    const duration = Number(process.hrtime.bigint() - start) / 1e6;
    const route = req.route?.path ? `${req.baseUrl}${req.route.path}` : req.path;
    httpRequestsTotal.inc({ method: req.method, route, status: String(res.statusCode) });
    httpRequestDuration.observe({ method: req.method, route, status: String(res.statusCode) }, duration);
    ApiRequestMetric.create({ requestId: req.requestId, method: req.method, route, statusCode: res.statusCode, durationMs: duration, createdAt: new Date() }).catch(() => {});
  });
  next();
}
export const metricsRegistry = client.register;
