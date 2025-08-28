const User = require("../models/User");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json({ users });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Register new user
const register = async (req, res) => {
    const { name, email, password, age, address, childId, guardianName, package } = req.body;
    
    try {
        const newUser = new User({ 
            name, email, password, age, address, childId, guardianName, package 
        });
        await newUser.save();
        res.status(201).json({ user: newUser });
    } catch (err) {
        if (err.code === 11000) {
            res.status(400).json({ message: "Email already exists" });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// Get user by ID
const getById = async (req, res) => {
    const id = req.params.id;
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        if (err.name === 'CastError') {
            res.status(400).json({ message: "Invalid user ID format" });
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// Update User details
const updateUser = async (req, res) => {
    const id = req.params.id;
    const { name, email, age, address, childId, guardianName, package } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { name, email, age, address, childId, guardianName, package },
            { new: true, runValidators: true }
        );
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const id = req.params.id;
    
    try {
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        res.status(200).json({ message: "User deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user balance
const getBalance = async (req, res) => {
    const id = req.params.id;
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update user balance
const updateBalance = async (req, res) => {
    const id = req.params.id;
    const { amount } = req.body;
    
    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        user.balance += amount;
        await user.save();
        
        res.status(200).json({ balance: user.balance });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllUsers,
    register,
    getById,
    updateUser,
    deleteUser,
    getBalance,
    updateBalance
};