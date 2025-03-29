import Aisle from '../models/Aisle.js';

// @desc    Get all aisles
// @route   GET /api/aisles
// @access  Public
export const getAisles = async (req, res) => {
    try {
        const aisles = await Aisle.find().sort({ aisle_id: 1 });
        res.json(aisles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single aisle by ID
// @route   GET /api/aisles/:aisleId
// @access  Public
export const getAisleById = async (req, res) => {
    try {
        const aisle = await Aisle.findOne({ 
            aisle_id: parseInt(req.params.aisleId) 
        });
        
        if (!aisle) {
            return res.status(404).json({ message: 'Aisle not found' });
        }
        
        res.json(aisle);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};