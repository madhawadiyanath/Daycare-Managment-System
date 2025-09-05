const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ["income", "expense", "transfer"],
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    },
    recipient: {
        type: String
    },
    status: {
        type: String,
        enum: ["completed", "pending", "failed"],
        default: "completed"
    }
});

module.exports = mongoose.model("Transaction", transactionSchema);