const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database connection
mongoose.connect("mongodb+srv://admin:P1gg9RWK1nsqkDZa@cluster0.sfvhdit.mongodb.net/yourDatabaseName?retryWrites=true&w=majority")
    .then(() => {
        console.log("Connected to MongoDB");
        
        // Load model - changed to User model
        const User = require("./models/User");
        
        // Routes - updated for new fields
        app.post("/register", async (req, res) => {
            const { name, email, age, address, transactionId, childId, guardianName, package } = req.body;
            try {
                await User.create({ name, email, age, address, transactionId, childId, guardianName, package });
                res.send({ status: "ok" });
            } catch (err) {
                res.send({ status: "error", error: err.message });
            }
        });
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB:", error);
    });