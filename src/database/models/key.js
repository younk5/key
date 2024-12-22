const mongoose = require('mongoose');

const keySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    key: { type: String, required: true, unique: true }, 
    description: { type: String, default: 'Default' },
    gameType: { type: String, required: true },
    duration: { type: Number, required: true },
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, required: true },
    isPaused: { type: Boolean, default: false },
    remainingTime: { type: Number, default: null }
});

keySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Key', keySchema);
