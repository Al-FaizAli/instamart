// server/controllers/product.js
import Product from '../models/Product.js';

// @desc    Get all products
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().limit(50);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
export const getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([
            { $sample: { size: 12 } },
            {
                $lookup: {
                    from: 'departments',
                    localField: 'department_id',
                    foreignField: 'department_id',
                    as: 'department'
                }
            },
            { $unwind: '$department' }
        ]);
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get products by department
// @route   GET /api/products/department/:departmentId
// @access  Public
export const getProductsByDepartment = async (req, res) => {
    try {
        const products = await Product.find({
            department_id: parseInt(req.params.departmentId)
        });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get product search suggestions
// @route   GET /api/products/search/suggestions
// @access  Public
export const getSearchSuggestions = async (req, res) => {
    try {
        const query = req.query.q;
        const suggestions = await Product.find(
            {
                product_name: { $regex: query, $options: 'i' }
            },
            { product_name: 1 }
        )
            .limit(10)
            .sort({ product_name: 1 });

        res.json(suggestions);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch suggestions' });
    }
};

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
    try {
        const query = req.query.q;
        const products = await Product.find(
            {
                product_name: { $regex: query, $options: 'i' }
            }
        )
            .limit(10)
            .sort({ product_name: 1 });

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Failed to search products' });
    }
};