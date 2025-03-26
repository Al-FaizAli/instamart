// server/routes/product.js
import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductsByDepartment,
  searchProducts,
} from '../controllers/product.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/department/:departmentId', getProductsByDepartment);
router.get('/search', searchProducts);

export default router;