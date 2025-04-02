// server/controllers/cart.js
import User from '../models/User.js';
import Product from '../models/Product.js';

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Get product details for items in cart
        const productIds = user.cart.map(item => item.product_id);
        const products = await Product.find({ product_id: { $in: productIds } });

        const cartWithProducts = user.cart.map(cartItem => {
            const product = products.find(p => p.product_id === cartItem.product_id);
            return {
                ...cartItem.toObject(),
                product_details: product || null
            };
        });

        res.status(200).json({
            success: true,
            cart: cartWithProducts
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching cart'
        });
    }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
    try {
        const { product_id, quantity = 1 } = req.body;

        // Validate product exists
        const product = await Product.findOne({ product_id });
        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check if product already in cart
        const existingItemIndex = user.cart.findIndex(
            item => item.product_id === product_id
        );

        if (existingItemIndex >= 0) {
            // Update quantity if already in cart
            user.cart[existingItemIndex].quantity += quantity;
        } else {
            // Add new item to cart
            user.cart.push({ product_id, quantity });
        }

        await user.save();

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while adding to cart'
        });
    }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:product_id
// @access  Private
export const updateCartItem = async (req, res) => {
    try {
        const { product_id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                success: false,
                message: 'Quantity must be at least 1'
            });
        }

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const itemIndex = user.cart.findIndex(
            item => item.product_id === parseInt(product_id)
        );

        if (itemIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        user.cart[itemIndex].quantity = quantity;
        await user.save();

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while updating cart'
        });
    }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:product_id
// @access  Private
export const removeFromCart = async (req, res) => {
    try {
        const { product_id } = req.params;

        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const initialLength = user.cart.length;
        user.cart = user.cart.filter(
            item => item.product_id !== parseInt(product_id)
        );

        if (user.cart.length === initialLength) {
            return res.status(404).json({
                success: false,
                message: 'Item not found in cart'
            });
        }

        await user.save();

        res.status(200).json({
            success: true,
            cart: user.cart
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while removing from cart'
        });
    }
};

// @desc    Clear cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
    try {
        const user = await User.findOne({ userId: req.user.userId });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        user.cart = [];
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully'
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while clearing cart'
        });
    }
};