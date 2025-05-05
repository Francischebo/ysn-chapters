const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    establishedYear: { type: Number, required: true },
    membersCount: { type: Number, default: 0 },
    description: { type: String },
    status: { type: String, default: 'pending' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chapter', ChapterSchema);