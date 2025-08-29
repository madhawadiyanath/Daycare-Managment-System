const User = require("../models/UserModel");

// Get all users
const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, users });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Register new user (simplified version)
const register = async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        const newUser = new User({ name, email, password });
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
const getUserById = async (req, res) => {
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
    const { name, email } = req.body;

    try {
        const user = await User.findByIdAndUpdate(
            id,
            { name, email },
            { new: true, runValidators: true }
        ).select("-password");
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        res.status(200).json({ success: true, user });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const id = req.params.id;
    
    try {
        const user = await User.findByIdAndDelete(id);
        
        if (!user) {
            return res.status(404).json({ 
                success: false, 
                message: "User not found" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "User deleted successfully" 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllUsers,
    register,
    getUserById,
    updateUser,
    deleteUser
};