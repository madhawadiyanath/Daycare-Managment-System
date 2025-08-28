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
    password: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    // Finance management fields
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
    },
    balance: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);