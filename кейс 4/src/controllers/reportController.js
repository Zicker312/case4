import { equipmentLoad } from '../services/requestService.js';
export async function equipmentLoadReport(req, res) { res.json(await equipmentLoad(req.query)); }
