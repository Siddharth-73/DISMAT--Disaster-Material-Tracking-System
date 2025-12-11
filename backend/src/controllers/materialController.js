import Material from "../models/Material.js";

// POST /materials/receipt
export const logReceipt = async (req, res) => {
  try {
    const { name, category, unit, warehouse, quantity, source, remarks } = req.body;

    if (!name || !warehouse || !quantity) {
      return res.status(400).json({
        message: "name, warehouse, and quantity are required"
      });
    }

    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      return res.status(400).json({ message: "quantity must be > 0" });
    }

    let material = await Material.findOne({ name, warehouse });

    const receiptEntry = {
      quantity: qty,
      source,
      remarks,
      receivedBy: req.user.id
    };

    if (!material) {
      material = await Material.create({
        name,
        category,
        unit,
        warehouse,
        totalReceived: qty,
        currentStock: qty,
        lastReceiptAt: new Date(),
        receipts: [receiptEntry]
      });
    } else {
      material.totalReceived += qty;
      material.currentStock += qty;
      material.lastReceiptAt = new Date();
      material.receipts.push(receiptEntry);
      await material.save();
    }

    res.status(201).json({
      message: "Material receipt logged",
      material
    });
  } catch (error) {
    console.log("Receipt Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// GET /materials/stock
export const getStock = async (req, res) => {
  try {
    const { warehouse, category, name } = req.query;

    const filter = {};
    if (warehouse) filter.warehouse = warehouse;
    if (category) filter.category = category;
    if (name) filter.name = new RegExp(name, "i");

    const materials = await Material.find(filter).sort({ name: 1 });

    res.json({
      count: materials.length,
      materials
    });
  } catch (error) {
    console.log("Stock Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
