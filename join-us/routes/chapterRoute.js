const express = require('express');
const router = express.Router();
const Chapter = require('../models/Chapter');

// POST - Create new chapter
router.post('/chapters', async(req, res) => {
    const chapter = new Chapter(req.body);
    await chapter.save();
    res.status(201).json({ message: "Chapter created!" });
});

// GET all chapters
router.get('/chapters', async(req, res) => {
    try {
        const chapters = await Chapter.find().sort({ createdAt: -1 });
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching chapters' });
    }
});

// GET - Single chapter by ID
router.get('/chapters/:id', async(req, res) => {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: "Chapter not found" });
    res.json(chapter);
});

// PUT - Update chapter
router.put('/chapters/:id', async(req, res) => {
    const updated = await Chapter.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
});
// DELETE a chapter by ID
router.delete('/chapters/:id', async(req, res) => {
    try {
        await Chapter.findByIdAndDelete(req.params.id);
        res.json({ message: "Chapter deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete chapter", error: err.message });
    }
});

module.exports = router;