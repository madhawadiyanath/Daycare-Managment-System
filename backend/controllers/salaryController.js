const Salary = require("../models/SalaryModel");

// Get all salaries
const getAllSalaries = async (req, res) => {
    try {
        const salaries = await Salary.find().sort({ createdAt: -1 });
        res.status(200).json({ success: true, salaries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Create new salary
const createSalary = async (req, res) => {
    const { empID, empName, email, basicSalary, month, allowances, loanDeductions } = req.body;
    
    try {
        const newSalary = new Salary({
            empID,
            empName,
            email,
            basicSalary,
            month,
            allowances: allowances || 0,
            loanDeductions: loanDeductions || 0
        });
        
        await newSalary.save();
        
        res.status(201).json({ 
            success: true, 
            salary: newSalary 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get salary by ID
const getSalaryById = async (req, res) => {
    const id = req.params.id;
    
    try {
        const salary = await Salary.findById(id);
        if (!salary) {
            return res.status(404).json({ 
                success: false, 
                message: "Salary record not found" 
            });
        }
        res.status(200).json({ success: true, salary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Update salary
const updateSalary = async (req, res) => {
    const id = req.params.id;
    const { empID, empName, email, basicSalary, month, allowances, loanDeductions } = req.body;
    
    try {
        const salary = await Salary.findByIdAndUpdate(
            id,
            { 
                empID, 
                empName, 
                email, 
                basicSalary, 
                month, 
                allowances: allowances || 0, 
                loanDeductions: loanDeductions || 0,
                updatedAt: Date.now()
            },
            { new: true, runValidators: true }
        );
        
        if (!salary) {
            return res.status(404).json({ 
                success: false, 
                message: "Salary record not found" 
            });
        }
        
        res.status(200).json({ success: true, salary });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Delete salary
const deleteSalary = async (req, res) => {
    const id = req.params.id;
    
    try {
        const salary = await Salary.findByIdAndDelete(id);
        
        if (!salary) {
            return res.status(404).json({ 
                success: false, 
                message: "Salary record not found" 
            });
        }
        
        res.status(200).json({ 
            success: true, 
            message: "Salary record deleted successfully" 
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// Get salaries by employee ID
const getSalariesByEmpId = async (req, res) => {
    const empID = req.params.empID;
    
    try {
        const salaries = await Salary.find({ empID }).sort({ month: -1 });
        res.status(200).json({ success: true, salaries });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getAllSalaries,
    createSalary,
    getSalaryById,
    updateSalary,
    deleteSalary,
    getSalariesByEmpId
};
