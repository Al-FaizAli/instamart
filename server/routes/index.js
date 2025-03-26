// server/routes/index.js
import express from 'express';
import productRoutes from './product.js';
import departmentRoutes from './department.js';

const router = express.Router();

router.use('/api/products', productRoutes);
router.use('/api/departments', departmentRoutes);

export default router;