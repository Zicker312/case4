import { canTransition, validateBrigade } from '../../src/domain/policies.js';
test('status transition policy',()=>{expect(canTransition('new','in_progress')).toBe(true);expect(canTransition('done','new')).toBe(false);});
test('brigade requires one lead and unique technicians',()=>{expect(validateBrigade([{technicianId:'1',role:'lead'}]).ok).toBe(true);expect(validateBrigade([{technicianId:'1',role:'lead'},{technicianId:'1',role:'member'}]).ok).toBe(false);expect(validateBrigade([{technicianId:'1',role:'member'}]).ok).toBe(false);});
