const Supplier = require('../models/SupplierModel');

// Create supplier
exports.createsupplier = async (req, res) => {
  try {
    const { name, address, contact, email, company } = req.body;
    if (!name || !address || !contact || !email || !company) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    const supplier = new Supplier({ name, address, contact, email, company });
    await supplier.save();
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to add supplier' });
  }
};

// Get all suppliers
exports.getsupplier = async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json({ success: true, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch suppliers' });
  }
};

// Delete supplier
exports.deletesupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to delete supplier' });
  }
};

// Update supplier
exports.updatesupplier = async (req, res) => {
  try {
    const { name, address, contact, email, company } = req.body;
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { name, address, contact, email, company },
      { new: true }
    );
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to update supplier' });
  }
};

// Search suppliers by name
exports.searchSuppliers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Name query parameter is required' });
    }

    // Match names starting with the input string
    const regexPattern = new RegExp(`^${name}`, 'i'); // Case-insensitive match for names starting with the input
    const suppliers = await Supplier.find({
      name: { $regex: regexPattern } // Apply regex pattern
    });

    res.json(suppliers);
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to search suppliers' });
  }
};

