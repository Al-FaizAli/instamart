// server/controllers/product.js
import Product from '../models/Product.js';
import Department from '../models/Department.js';

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
      { $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: 'department_id',
          as: 'department'
        }},
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

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
export const searchProducts = async (req, res) => {
  try {
    const query = req.query.q;
    const products = await Product.find({
      product_name: { $regex: query, $options: 'i' }
    }).limit(20);
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};