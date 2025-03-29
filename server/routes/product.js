// server/routes/product.js
import express from 'express';
import {
  getProducts,
  getFeaturedProducts,
  getProductsByDepartment,
  getSearchSuggestions,
  searchProducts
} from '../controllers/product.js';
import Product from '../models/Product.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/department/:departmentId', getProductsByDepartment);
router.get('/search/suggestions', getSearchSuggestions);
router.get('/search', searchProducts);
// Get products by multiple IDs
router.get('/by-ids', async (req, res) => {
  try {
    const ids = req.query.ids.split(',').map(id => {
      const parsed = parseInt(id.trim());
      if (isNaN(parsed)) throw new Error(`Invalid ID: ${id}`);
      return parsed;
    });

    const products = await Product.find({ product_id: { $in: ids } });

    // Maintain order from request
    const productMap = new Map();
    products.forEach(product => {
      productMap.set(product.product_id, product);
    });

    const orderedProducts = ids.map(id => productMap.get(id)).filter(Boolean);

    res.json(orderedProducts);
  } catch (err) {
    console.error('Error in /by-ids:', err);
    res.status(500).json({
      message: 'Failed to fetch products',
      error: err.message
    });
  }
});
export default router;