import User from '../models/User.js';
import { generateRandomUserId } from '../utils/generateUserId.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Helper function to generate JWT token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            email: user.email,
            userId: user.userId
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
    );
};

// User registration
export const signup = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already in use'
            });
        }

        // Generate user ID from orders table
        const userId = await generateRandomUserId();

        // Create new user
        const user = new User({
            userId,
            name,
            email,
            password
        });

        // Save user to database
        await user.save();

        // Generate token
        const token = generateToken(user);

        // Return response without password
        const userResponse = {
            id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        res.status(201).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// User login
export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Validate password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate token
        const token = generateToken(user);

        // Return response without password
        const userResponse = {
            id: user._id,
            userId: user.userId,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt
        };
        res.status(200).json({
            success: true,
            token,
            user: userResponse
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// Token verification
// authController.js

export const verifyToken = async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

        // Verify without immediate expiration check
        const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });

        // Check if token is expired
        const now = Math.floor(Date.now() / 1000);
        if (decoded.exp < now) {
            return res.status(401).json({ message: 'Token expired' });
        }

        // Find user and verify
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // If token is nearing expiration, issue a new one
        const tokenExpiryBuffer = 15 * 60; // 15 minutes
        if (decoded.exp - now < tokenExpiryBuffer) {
            const newToken = jwt.sign(
                { id: user._id, email: user.email, userId: user.userId },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );
            return res.status(200).json({
                user: { id: user._id, userId: user.userId, name: user.name, email: user.email },
                token: newToken
            });
        }

        return res.status(200).json({
            user: { id: user._id, userId: user.userId, name: user.name, email: user.email }
        });

    } catch (error) {
        console.error("Token verification error:", error);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const logout = (req, res) => {
    try {
        // For JWT, logout is typically handled on the client side by clearing the token.
        // Optionally, you can implement token invalidation logic here (e.g., using a token blacklist).
        res.status(200).json({ success: true, message: 'User logged out successfully' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error during logout' });
    }
};