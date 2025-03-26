// server/controllers/department.js
import Department from '../models/Department.js';

// @desc    Get all departments
// @route   GET /api/departments
// @access  Public
export const getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();
        res.json(departments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getDepartmentNameWithId = async (req, res) => {
    try {
        const products = await Department.findOne({
            department_id: parseInt(req.params.departmentId)
        });
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}