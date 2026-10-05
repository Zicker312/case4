import * as service from '../services/equipmentService.js';
import { validateEquipmentBody, validatePagination } from '../validators/common.js';
import { getWeather } from '../services/weatherService.js';
export async function list(req, res) { validatePagination(req.query); res.json(await service.listEquipment(req.query)); }
export async function get(req, res) { res.json(await service.getEquipment(req.params.id)); }
export async function create(req, res) { const item = await service.createEquipment(validateEquipmentBody(req.body)); res.status(201).location(`/api/equipment/${item.id}`).json(item); }
export async function update(req, res) { res.json(await service.updateEquipment(req.params.id, validateEquipmentBody(req.body, true))); }
export async function remove(req, res) { await service.deleteEquipment(req.params.id); res.status(204).send(); }
export async function requests(req, res) { res.json(await service.equipmentRequests(req.params.id, req.query)); }
export async function weather(req, res) { const location = await service.weatherLocation(req.params.id); res.json(await getWeather(location)); }
