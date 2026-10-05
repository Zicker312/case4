import * as service from '../services/requestService.js';
import { validateRequestBody, validateStatus, validatePagination } from '../validators/common.js';
export async function list(req,res){ validatePagination(req.query); res.json(await service.listRequests(req.query)); }
export async function get(req,res){ res.json(await service.getRequest(req.params.id)); }
export async function create(req,res){ const item=await service.createRequest(validateRequestBody(req.body),req.user); res.status(201).location(`/api/requests/${item.id}`).json(item); }
export async function update(req,res){ res.json(await service.updateRequest(req.params.id,validateRequestBody(req.body,true),req.user)); }
export async function status(req,res){ res.json(await service.changeStatus(req.params.id,validateStatus(req.body.status),req.user)); }
export async function remove(req,res){ await service.deleteRequest(req.params.id); res.status(204).send(); }
export async function assignees(req,res){ if(!Array.isArray(req.body.assignees)) return res.status(422).json({error:{code:'VALIDATION_ERROR',message:'assignees должен быть массивом',details:[],requestId:req.requestId}}); const rows=req.body.assignees.map(x=>({technicianId:x.technicianId,role:x.role,hours:Number(x.hours)||1})); res.json(await service.replaceAssignees(req.params.id,rows)); }
export async function removeAssignee(req,res){ await service.removeAssignee(req.params.id,req.params.technicianId); res.status(204).send(); }
export async function history(req,res){ res.json(await service.getHistory(req.params.id)); }
