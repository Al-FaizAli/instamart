import express from 'express';
import { auth } from '../middlewares/auth.js';
import { getPastProducts } from '../controllers/recommendation.js';

const router = express.Router();

router.get('/past', auth, getPastProducts);

export default router;
