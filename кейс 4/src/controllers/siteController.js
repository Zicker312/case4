import { summary } from '../services/siteService.js';
export async function getSummary(req, res) { res.json(await summary(req.params.id)); }
