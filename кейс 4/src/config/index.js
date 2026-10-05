import 'dotenv/config';

const bool = (value, fallback = false) => value === undefined ? fallback : value === 'true';

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 3000),
  logLevel: process.env.LOG_LEVEL || 'info',
  jwtSecret: process.env.JWT_SECRET || 'dev-only-change-me',
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL || '7d',
  refreshCookieName: process.env.REFRESH_COOKIE_NAME || 'maintenance_refresh',
  cookieSecure: bool(process.env.COOKIE_SECURE, false),
  cookieSameSite: process.env.COOKIE_SAMESITE || 'strict',
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost').split(',').map(x => x.trim()).filter(Boolean),
  loginRateWindowMs: Number(process.env.LOGIN_RATE_WINDOW_MS || 900000),
  loginRateMax: Number(process.env.LOGIN_RATE_MAX || 10),
  bodyLimit: process.env.BODY_LIMIT || '100kb',
  requestTimeoutMs: Number(process.env.REQUEST_TIMEOUT_MS || 5000),
  weatherApiUrl: process.env.WEATHER_API_URL || 'https://api.open-meteo.com/v1/forecast',
  db: {
    name: process.env.DB_NAME || 'maintenance_db',
    user: process.env.DB_USER || 'maintenance_app',
    password: process.env.DB_PASSWORD || 'maintenance_password',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 5432),
    poolMax: Number(process.env.DB_POOL_MAX || 10),
    poolMin: Number(process.env.DB_POOL_MIN || 0),
    poolAcquire: Number(process.env.DB_POOL_ACQUIRE || 10000),
    poolIdle: Number(process.env.DB_POOL_IDLE || 10000)
  }
};

if (config.nodeEnv === 'production' && (config.jwtSecret === 'dev-only-change-me' || config.db.password === 'maintenance_password')) {
  throw new Error('В production необходимо заменить JWT_SECRET и DB_PASSWORD');
}
