// server/config/db.js
import dns from 'dns';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Use Google Public DNS for SRV record resolution
// (fixes ECONNREFUSED on networks whose local DNS blocks SRV lookups)
dns.setServers(['8.8.8.8', '8.8.4.4']);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`MongoDB unavailable: ${error.message}`);
    console.warn('Server will continue running, but database routes may fail until MongoDB is reachable.');
  }
};

export default connectDB;