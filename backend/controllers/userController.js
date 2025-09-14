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
    const { username, name, email, password } = req.body;
    
    try {
        const newUser = new User({ username, name, email, password });
        await newUser.save();
        
        res.status(201).json({ user: newUser });
    } catch (err) {
        if (err.code === 11000) {
            // Check which field caused the duplicate key error
            if (err.keyPattern && err.keyPattern.username) {
                res.status(400).json({ message: "Username already exists" });
            } else if (err.keyPattern && err.keyPattern.email) {
                res.status(400).json({ message: "Email already exists" });
            } else {
                res.status(400).json({ message: "Username or email already exists" });
            }
        } else {
            res.status(500).json({ message: err.message });
        }
    }
};

// Get user by username
const getUserByUsername = async (req, res) => {
    const username = req.params.username;
    
    try {
        const user = await User.findOne({ username }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ user });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update User details
const updateUser = async (req, res) => {
    const username = req.params.username;
    const { name, email } = req.body;

    try {
        const user = await User.findOneAndUpdate(
            { username },
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
        if (err.code === 11000) {
            res.status(400).json({ success: false, message: "Email already exists" });
        } else {
            res.status(500).json({ success: false, message: err.message });
        }
    }
};

// Delete User
const deleteUser = async (req, res) => {
    const username = req.params.username;
    
    try {
        const user = await User.findOneAndDelete({ username });
        
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

// Login user
const login = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find user by username
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Check password (simple comparison - in production, use bcrypt)
        if (user.password !== password) {
            return res.status(401).json({ message: "Invalid username or password" });
        }
        
        // Return user data without password
        const userResponse = {
            username: user.username,
            name: user.name,
            email: user.email,
            _id: user._id,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };
        
        res.status(200).json({ 
            success: true, 
            message: "Login successful",
            user: userResponse 
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllUsers,
    register,
    login,
    getUserByUsername,
    updateUser,
    deleteUser
};