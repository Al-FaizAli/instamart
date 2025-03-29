import express from 'express';
import { getAisles, getAisleById } from '../controllers/aisle.js';

const router = express.Router();

router.get('/', getAisles);
router.get('/:aisleId', getAisleById);

export default router;