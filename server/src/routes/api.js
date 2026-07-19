const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const Reel = require('../models/Reel');

// ==========================================
// CATEGORIES ROUTES
// ==========================================

// GET all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create category
router.post('/categories', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    // Check if category already exists (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists' });
    }

    const category = new Category({ name: name.trim() });
    await category.save();
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT edit category
router.put('/categories/:id', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Category name is required' });
    }

    const { id } = req.params;

    // Check if another category has the same name
    const existing = await Category.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      _id: { $ne: id },
    });
    if (existing) {
      return res.status(400).json({ error: 'Another category with this name already exists' });
    }

    const category = await Category.findByIdAndUpdate(
      id,
      { name: name.trim() },
      { new: true, runValidators: true }
    );

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE category (and cascade delete all associated reels)
router.delete('/categories/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Delete all reels belonging to this category
    await Reel.deleteMany({ categoryId: id });

    res.json({ message: 'Category and all associated reels deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==========================================
// REELS ROUTES
// ==========================================

// GET reels (optionally filtered by categoryId)
router.get('/reels', async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = {};
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const reels = await Reel.find(filter).sort({ createdAt: -1 });
    res.json(reels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST save a new reel
router.post('/reels', async (req, res) => {
  try {
    const { url, title, categoryId } = req.body;

    if (!url || url.trim() === '') {
      return res.status(400).json({ error: 'Reel URL is required' });
    }
    if (!title || title.trim() === '') {
      return res.status(400).json({ error: 'Reel title is required' });
    }
    if (!categoryId) {
      return res.status(400).json({ error: 'Category is required' });
    }

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(400).json({ error: 'Invalid Category ID' });
    }

    const reel = new Reel({
      url: url.trim(),
      title: title.trim(),
      categoryId,
    });

    await reel.save();
    res.status(201).json(reel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT edit a reel
router.put('/reels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { url, title, categoryId } = req.body;

    const updateFields = {};
    if (url !== undefined) {
      if (url.trim() === '') {
        return res.status(400).json({ error: 'Reel URL cannot be empty' });
      }
      updateFields.url = url.trim();
    }
    if (title !== undefined) {
      if (title.trim() === '') {
        return res.status(400).json({ error: 'Reel title cannot be empty' });
      }
      updateFields.title = title.trim();
    }
    if (categoryId !== undefined) {
      // Verify category exists
      const category = await Category.findById(categoryId);
      if (!category) {
        return res.status(400).json({ error: 'Invalid Category ID' });
      }
      updateFields.categoryId = categoryId;
    }

    const reel = await Reel.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    res.json(reel);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE a reel
router.delete('/reels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const reel = await Reel.findByIdAndDelete(id);

    if (!reel) {
      return res.status(404).json({ error: 'Reel not found' });
    }

    res.json({ message: 'Reel deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
