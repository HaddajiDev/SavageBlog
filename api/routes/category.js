const express = require('express');
const router = express.Router();
const Category = require('../models/category');


// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();
    res.send({categories: categories});
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

// Get a category by ID
router.get('/:id', (req, res) => {
  res.send({category: res.category});
});

// Create a new category
router.post('/', async (req, res) => {
  const category = new Category({
    name: req.body.name,
    description: req.body.description,
  });

  try {
    const newCategory = await category.save();
    res.status(201).send({category : newCategory});
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});


module.exports = router;
