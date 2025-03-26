// server/models/Department.js
import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
  department_id: {
    type: Number,
    required: true,
    unique: true,
  },
  department: {
    type: String,
    required: true,
    trim: true,
  },
}, {
  timestamps: true,
});

const Department = mongoose.model('Department', departmentSchema);

export default Department;