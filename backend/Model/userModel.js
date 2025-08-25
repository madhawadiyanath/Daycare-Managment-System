const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    age: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    // New transaction fields
    transactionId: {
        type: String,
        unique: true
    },
    childId: {
        type: String
    },
    guardianName: {
        type: String
    },
    package: {
        type: String
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);