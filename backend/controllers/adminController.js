const { Admin } = require("../models/AdminModel");

// Admin login
const adminLogin = async (req, res) => {
    const { username, password } = req.body;
    
    try {
        // Find admin by username
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid admin credentials" 
            });
        }
        
        // Check password (in a real app, use bcrypt for password hashing)
        if (admin.password !== password) {
            return res.status(401).json({ 
                success: false,
                message: "Invalid admin credentials" 
            });
        }
        
        // Return admin data without password
        const adminResponse = {
            username: admin.username,
            role: admin.role,
            _id: admin._id,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
        };
        
        res.status(200).json({ 
            success: true, 
            message: "Admin login successful",
            admin: adminResponse
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ 
            success: false,
            message: "Server error during admin login" 
        });
    }
};

// Get admin dashboard data
const getDashboardData = async (req, res) => {
    try {
        // In a real app, you would fetch actual statistics here
        const dashboardData = {
            totalUsers: 0, // You would get this from your User model
            totalTransactions: 0, // Get from Transaction model
            totalRevenue: 0, // Calculate from transactions
            recentActivities: [] // Get recent activities
        };
        
        res.status(200).json({
            success: true,
            data: dashboardData
        });
    } catch (err) {
        console.error('Error getting dashboard data:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard data'
        });
    }
};

module.exports = {
    adminLogin,
    getDashboardData
};
