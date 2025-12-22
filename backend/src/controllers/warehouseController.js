import Warehouse from "../models/Warehouse.js";

// CREATE warehouse
export const createWarehouse = async (req, res) => {
  try {
    const { name, address, lat, lng, capacity } = req.body;

    if (!name || !address || !lat || !lng || !capacity) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const exists = await Warehouse.findOne({ name });
    if (exists) {
      return res.status(409).json({ message: "Warehouse already exists" });
    }

    const warehouse = await Warehouse.create({
      name,
      address,
      location: { lat, lng },
      capacity
    });

    res.status(201).json({
      message: "Warehouse created",
      warehouse
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// GET all warehouses
export const getWarehouses = async (req, res) => {
  const warehouses = await Warehouse.find();
  res.json(warehouses);
};

// TOGGLE active/inactive
export const toggleWarehouseStatus = async (req, res) => {
  const warehouse = await Warehouse.findById(req.params.id);
  if (!warehouse) {
    return res.status(404).json({ message: "Warehouse not found" });
  }

  warehouse.isActive = !warehouse.isActive;
  await warehouse.save();

  res.json({
    message: "Warehouse status updated",
    isActive: warehouse.isActive
  });
  res.json({
    message: "Warehouse status updated",
    isActive: warehouse.isActive
  });
};

// UPDATE warehouse
export const updateWarehouse = async (req, res) => {
  try {
    const { name, address, lat, lng, capacity, isActive } = req.body;
    const warehouse = await Warehouse.findById(req.params.id);

    if (!warehouse) {
      return res.status(404).json({ message: "Warehouse not found" });
    }

    if (name) warehouse.name = name;
    if (address) warehouse.address = address;
    if (capacity) warehouse.capacity = capacity;
    if (lat && lng) warehouse.location = { lat, lng };
    if (typeof isActive === "boolean") warehouse.isActive = isActive;

    await warehouse.save();
    res.json({ message: "Warehouse updated", warehouse });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE warehouse
export const deleteWarehouse = async (req, res) => {
  try {
    const warehouse = await Warehouse.findById(req.params.id);
    if (!warehouse) return res.status(404).json({ message: "Warehouse not found" });

    // TODO: Check if stock exists? For now soft delete might be safer but user asked for "Delete".
    // Let's do hard delete for now as per "Create / Delete" requirement.
    await warehouse.deleteOne();
    res.json({ message: "Warehouse deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
