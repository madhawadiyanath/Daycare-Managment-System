const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const salarySchema = new Schema({
    empID: {
        type: String,
        required: true
    },
    empName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    basicSalary: {
        type: Number,
        required: true
    },
    month: {
        type: String,
        required: true
    },
    allowances: {
        type: Number,
        default: 0
    },
    loanDeductions: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Salary", salarySchema);
