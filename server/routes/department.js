// server/routes/department.js
import express from 'express';
import { getDepartmentNameWithId, getDepartments } from '../controllers/department.js';
const router = express.Router();

router.get('/', getDepartments);
router.get('/:departmentId', getDepartmentNameWithId);
export default router;