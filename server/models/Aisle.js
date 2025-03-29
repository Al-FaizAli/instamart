import mongoose from 'mongoose';

const aisleSchema = new mongoose.Schema({
    aisle_id: {
        type: Number,
        required: true,
        unique: true,
    },
    aisle: {
        type: String,
        required: true,
        trim: true,
    },
}, {
    timestamps: true,
});

const Aisle = mongoose.model('Aisle', aisleSchema);

export default Aisle;