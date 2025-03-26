// server/models/Product.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  product_id: {
    type: Number,
    required: true,
    unique: true,
  },
  product_name: {
    type: String,
    required: true,
    trim: true,
  },
  aisle_id: {
    type: Number,
    required: true,
  },
  department_id: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,
});

const Product = mongoose.model('Product', productSchema);

export default Product;