const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find().populate("userId", "name email");
        res.status(200).json({ transactions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new transaction
const createTransaction = async (req, res) => {
    const { userId, amount, type, category, description } = req.body;
    
    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Update user balance based on transaction type
        if (type === "income") {
            user.balance += amount;
        } else if (type === "expense") {
            user.balance -= amount;
        }
        
        const newTransaction = new Transaction({
            userId,
            amount,
            type,
            category,
            description
        });
        
        await newTransaction.save();
        await user.save();
        
        res.status(201).json({ transaction: newTransaction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const transactions = await Transaction.find({ userId }).sort({ date: -1 });
        res.status(200).json({ transactions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
    const id = req.params.id;
    
    try {
        const transaction = await Transaction.findById(id).populate("userId", "name email");
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        res.status(200).json({ transaction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update transaction
const updateTransaction = async (req, res) => {
    const id = req.params.id;
    const { amount, type, category, description } = req.body;
    
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            id,
            { amount, type, category, description },
            { new: true, runValidators: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        
        res.status(200).json({ transaction });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    const id = req.params.id;
    
    try {
        const transaction = await Transaction.findByIdAndDelete(id);
        
        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }
        
        res.status(200).json({ message: "Transaction deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllTransactions,
    createTransaction,
    getUserTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction
};