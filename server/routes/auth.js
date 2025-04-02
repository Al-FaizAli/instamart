import express from 'express';
import { signup, login, verifyToken,logout } from '../controllers/auth.js';

const router = express.Router();

// @route   POST /api/auth/signup
// @desc    Register new user
// @access  Public
router.post('/signup', signup);

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/verify
// @desc    Verify JWT token
// @access  Private
router.get('/verify', verifyToken);

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', logout);

export default router;