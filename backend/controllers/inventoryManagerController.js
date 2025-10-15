// Issue inventory item
const IssueItem = require('../models/issueItem');
const nodemailer = require('nodemailer');
// Email notification for low stock
const sendLowStockEmail = async (lowStockItems) => {
  try {
    console.log("Sending low stock email to inventory managers...");
    const managers = await InventoryManager.find().select('email');
    const emails = managers.map(m => m.email).filter(Boolean);
    console.log("Manager emails:", emails);
    if (emails.length === 0 || !lowStockItems || lowStockItems.length === 0) {
      console.log("No emails or low stock items to notify.");
      return;
    }

    // Configure nodemailer (use your SMTP credentials)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "inventorymanagementsystemday@gmail.com",
        pass: "kaxrsujnmqkxahly",
      },
    });
    
    // Build email content
    const itemList = lowStockItems.map(item =>
      `<li><b>${item.name}</b> (${item.category}) - Stock: ${item.stock}</li>`
    ).join('');
    const html = `
      <h3>Low Stock Alert</h3>
      <p>The following inventory items are low in stock (5 units or less):</p>
      <ul>${itemList}</ul>
      <p>Please restock as soon as possible.</p>
    `;

    await transporter.sendMail({
      from: 'inventorymanagementsystemday@gmail.com',
      to: [...new Set([...(Array.isArray(emails) ? emails : [emails]).filter(Boolean), 'Hansalakaubayasena@gmail.com'])].join(','),
      subject: 'Low Stock Alert - Inventory Management',
      html,
    });

    console.log("Low stock email sent successfully.");
  } catch (error) {
    console.error("Failed to send low stock email:", error);
  }
};
const issueInventoryItem = async (req, res) => {
  try {
    console.log("Issuing inventory item...");
    const { category, name, quantity, issueDate } = req.body;
    if (!category || !name || !quantity || !issueDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    // Optionally, check if enough stock exists and decrement
    const item = await InventoryItem.findOne({ name, category });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    if (item.stock < quantity) {
      return res.status(400).json({ success: false, message: 'Not enough stock' });
    }
    item.stock -= quantity;
    await item.save();
    const newIssue = new IssueItem({ category, name, quantity, issueDate });
    await newIssue.save();
    // Check for low stock and send email if needed
    const lowStockItems = await InventoryItem.find({ stock: { $gt: 0, $lte: 5 } });
    console.log("Low stock items:", lowStockItems);
    if (lowStockItems.length > 0) {
      await sendLowStockEmail(lowStockItems);
    }
    res.json({ success: true, issue: newIssue });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Delete inventory item by id
const deleteInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InventoryItem.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Update inventory item by id
const updateInventoryItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, stock, expiry, supplier } = req.body;
    const updated = await InventoryItem.findByIdAndUpdate(
      id,
      { $set: { name, category, stock, expiry, supplier } },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: 'Item not found' });
    }
    // Check for low stock and send email if needed
    const lowStockItems = await InventoryItem.find({ stock: { $gt: 0, $lte: 5 } });
    if (lowStockItems.length > 0) {
      await sendLowStockEmail(lowStockItems);
    }
    res.json({ success: true, item: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Get all inventory items
const getInventoryItems = async (req, res) => {
  try {
    const items = await InventoryItem.find().sort({ createdOn: -1 });
    res.json({ success: true, data: items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// Add new inventory item (using InventoryItem model)
const InventoryItem = require('../models/inventoryItem');
const createInventoryItem = async (req, res) => {
  try {
    console.log("items adding")
    const { name, category, stock, expiry, supplier, manufacture } = req.body;
    if (!name || !category || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Name, category, and stock are required' });
    }
    const newItem = new InventoryItem({
      name,
      category,
      stock,
      expiry,
      supplier,
      manufacture,
    });
    await newItem.save();
    return res.json({ success: true, message: 'Item added successfully' });
  } catch (err) {
     res.status(500).json({ success: false, message: err.message });
  }
};

// Controller to check for low stock and send email
const notifyLowStock = async (req, res) => {
  try {
    // Find items with stock <= 5
    const lowStockItems = await InventoryItem.find({ stock: { $gt: 0, $lte: 5 } });
    if (lowStockItems.length === 0) {
      return res.json({ success: true, message: 'No low stock items.' });
    }
    await sendLowStockEmail(lowStockItems);
    res.json({ success: true, message: 'Low stock notification sent.', items: lowStockItems });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
const InventoryManager = require('../models/InventoryManagerModel');

// Create an inventory manager
const createInventoryManager = async (req, res) => {
  try {
    const { name, email, phone, username, password } = req.body;
    if (!name || !email || !username || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, username, and password are required' });
    }

    const emailExists = await InventoryManager.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ success: false, message: 'An inventory manager with this email already exists' });
    }

    const usernameExists = await InventoryManager.findOne({ username });
    if (usernameExists) {
      return res.status(400).json({ success: false, message: 'Username is already taken' });
    }

    const im = await InventoryManager.create({ name, email: email.toLowerCase().trim(), phone, username, password });
    const { password: _pw, ...safe } = im.toObject();
    return res.status(201).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Get all inventory managers
const getInventoryManagers = async (_req, res) => {
  try {
    const list = await InventoryManager.find().select('-password').sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: list });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Update an inventory manager
const updateInventoryManager = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone, username, password } = req.body;

    const existing = await InventoryManager.findById(id);
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Inventory manager not found' });
    }

    if (email && email !== existing.email) {
      const emailExists = await InventoryManager.findOne({ email: email.toLowerCase().trim() });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'An inventory manager with this email already exists' });
      }
    }

    if (username && username !== existing.username) {
      const usernameExists = await InventoryManager.findOne({ username: username.trim() });
      if (usernameExists) {
        return res.status(400).json({ success: false, message: 'Username is already taken' });
      }
    }

    const updates = {};
    if (typeof name !== 'undefined') updates.name = name;
    if (typeof email !== 'undefined') updates.email = email.toLowerCase().trim();
    if (typeof phone !== 'undefined') updates.phone = phone;
    if (typeof username !== 'undefined') updates.username = username.trim();
    if (password) updates.password = password; // Note: add hashing later if needed

    const updated = await InventoryManager.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );

    const { password: _pw, ...safe } = updated.toObject();
    return res.status(200).json({ success: true, data: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Delete an inventory manager
const deleteInventoryManager = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await InventoryManager.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Inventory manager not found' });
    }
    return res.status(200).json({ success: true, message: 'Deleted successfully' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// Login an inventory manager
const loginInventoryManager = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    // NOTE: In production, hash and compare passwords. Here it's plain text to match existing schema.
    const manager = await InventoryManager.findOne({ username: username.trim() });
    if (!manager) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (manager.password !== password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const { password: _pw, ...safe } = manager.toObject();
    return res.status(200).json({ success: true, manager: safe });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  createInventoryManager,
  getInventoryManagers,
  // Added update capability
  updateInventoryManager,
  deleteInventoryManager,
  loginInventoryManager,
  createInventoryItem,
  getInventoryItems,
  updateInventoryItem,
  deleteInventoryItem,
  issueInventoryItem,
  notifyLowStock,
};
