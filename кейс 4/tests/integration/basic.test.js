import request from 'supertest'; import { app } from '../../src/app.js';
test('live health is public',async()=>{const r=await request(app).get('/api/health/live');expect(r.status).toBe(200);expect(r.body.status).toBe('ok');});
test('protected requests require token',async()=>{const r=await request(app).get('/api/requests');expect(r.status).toBe(401);});
test('swagger is available',async()=>{const r=await request(app).get('/api/docs/');expect(r.status).toBe(200);});
