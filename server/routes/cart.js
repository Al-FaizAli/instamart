// server/routes/cart.js
import express from 'express';
import { 
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
} from '../controllers/cart.js';
import { auth } from '../middlewares/auth.js';

const router = express.Router();

// All routes require authentication
router.use(auth);

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:product_id', updateCartItem);
router.delete('/:product_id', removeFromCart);
router.delete('/', clearCart);

export default router;