// server/routes/index.js
import express from 'express';
import productRoutes from './product.js';
import departmentRoutes from './department.js';
import aisleRoutes from './aisle.js';

const router = express.Router();

router.use('/api/products', productRoutes);
router.use('/api/departments', departmentRoutes);
router.use('/api/aisles', aisleRoutes);

export default router;