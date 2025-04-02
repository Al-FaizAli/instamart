import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  order_id: {
    type: Number,
    index: true
  },
  user_id: {
    type: Number,
    required: true,
    index: true
  },
  order_number: Number,
  order_dow: Number,
  order_hour_of_day: Number,
  days_since_prior_order: Number
}, {
  timestamps: true
});

// Create index for faster queries
// orderSchema.index({ user_id: 1 });

export default mongoose.model('Order', orderSchema);