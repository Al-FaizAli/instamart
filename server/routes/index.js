// server/routes/index.js
import express from 'express';
import productRoutes from './product.js';
import departmentRoutes from './department.js';
import aisleRoutes from './aisle.js';
import authRoutes from './auth.js';
import cartRoutes from './cart.js';

const router = express.Router();

router.use('/api/products', productRoutes);
router.use('/api/departments', departmentRoutes);
router.use('/api/aisles', aisleRoutes);
router.use('/api/auth', authRoutes);
router.use('/api/cart', cartRoutes);

// Health check endpoint
router.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString()
    });
  });
  
export default router;