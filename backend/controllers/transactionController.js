const Transaction = require("../models/TransactionModel");
const User = require("../models/UserModel");
// Get all transactions
const getAllTransactions = async (req, res) => {
    try {
        const transactions = await Transaction.find()
            .sort({ date: -1 });
        res.status(200).json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create new transaction
const createTransaction = async (req, res) => {
    const { userId, type, amount, category, description, recipient } = req.body;
    
    try {
        // Skip user validation since userId is now a simple string
        // You can optionally validate if the user exists in your system
        
        const newTransaction = new Transaction({
            userId,
            type,
            amount,
            category,
            description,
            recipient
        });
        
        await newTransaction.save();
        
        res.status(201).json({ 
            success: true, 
            transaction: newTransaction 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get user transactions
const getUserTransactions = async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const transactions = await Transaction.find({ userId })
            .sort({ date: -1 });
        res.status(200).json({ success: true, transactions });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get transaction by ID
const getTransactionById = async (req, res) => {
    const id = req.params.id;
    
    try {
        const transaction = await Transaction.findById(id);
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: "Transaction not found" 
            });
        }
        res.status(200).json({ success: true, transaction });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update transaction
const updateTransaction = async (req, res) => {
    const id = req.params.id;
    const { type, amount, category, description, recipient } = req.body;
    
    try {
        const transaction = await Transaction.findByIdAndUpdate(
            id,
            { type, amount, category, description, recipient },
            { new: true, runValidators: true }
        );
        
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: "Transaction not found" 
            });
        }
        
        res.status(200).json({ success: true, transaction });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete transaction
const deleteTransaction = async (req, res) => {
    const id = req.params.id;
    
    try {
        const transaction = await Transaction.findByIdAndDelete(id);
        
        if (!transaction) {
            return res.status(404).json({ 
                success: false, 
                message: "Transaction not found" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Transaction deleted successfully" 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get transaction summary for user
const getTransactionSummary = async (req, res) => {
    const userId = req.params.userId;
    
    try {
        const transactions = await Transaction.find({ userId });
        
        const summary = {
            totalIncome: 0,
            totalExpense: 0,
            netBalance: 0,
            byCategory: {}
        };
        
        transactions.forEach(transaction => {
            if (transaction.type === "income") {
                summary.totalIncome += transaction.amount;
            } else if (transaction.type === "expense") {
                summary.totalExpense += transaction.amount;
            }
            
            if (!summary.byCategory[transaction.category]) {
                summary.byCategory[transaction.category] = 0;
            }
            summary.byCategory[transaction.category] += transaction.amount;
        });
        
        summary.netBalance = summary.totalIncome - summary.totalExpense;
        
        res.status(200).json({ success: true, summary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllTransactions,
    createTransaction,
    getUserTransactions,
    getTransactionById,
    updateTransaction,
    deleteTransaction,
    getTransactionSummary
};