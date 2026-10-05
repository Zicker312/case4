import { Site } from '../models/index.js';
export async function findById(id) { return Site.findByPk(id, { attributes: ['id', 'name', 'code', 'region', 'latitude', 'longitude'] }); }
