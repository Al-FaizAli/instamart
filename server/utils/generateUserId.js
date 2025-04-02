import Order from '../models/Order.js';

export const generateRandomUserId = async () => {
  try {
    // Get count of all orders for efficient random sampling
    const count = await Order.countDocuments();
    const random = Math.floor(Math.random() * count);
    
    // Get a random order using skip
    const randomOrder = await Order.findOne().skip(random).select('user_id');
    
    if (randomOrder && randomOrder.user_id) {
      return randomOrder.user_id;
    }
    
    // Fallback to random number if no orders found
    return Math.floor(Math.random() * 2000000) + 1;
  } catch (error) {
    console.error('Error generating user ID:', error);
    // Fallback with timestamp-based random number
    return Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000);
  }
};