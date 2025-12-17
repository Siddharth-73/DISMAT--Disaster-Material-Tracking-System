import DisasterCategory from "../models/DisasterCategory.js";

// GET all categories
export const getCategories = async (req, res) => {
  const categories = await DisasterCategory.find();
  res.json(categories);
};

// TOGGLE active/inactive
export const toggleCategory = async (req, res) => {
  const category = await DisasterCategory.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: "Category not found" });
  }

  category.isActive = !category.isActive;
  await category.save();

  res.json({
    message: "Category status updated",
    isActive: category.isActive
  });
};

// CREATE custom category
export const createCategory = async (req, res) => {
  const { name, code, color, icon } = req.body;

  if (!name || !code) {
    return res.status(400).json({ message: "Name and code required" });
  }

  const exists = await DisasterCategory.findOne({ code });
  if (exists) {
    return res.status(409).json({ message: "Category already exists" });
  }

  const category = await DisasterCategory.create({
    name,
    code,
    color,
    icon,
    source: "manual"
  });

  res.status(201).json(category);
};
