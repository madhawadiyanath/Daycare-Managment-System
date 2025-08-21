const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("It is working");
});

// Corrected MongoDB connection
mongoose.connect("mongodb+srv://admin:uktNIVQQ0X5MfySV@cluster0.8kk63n7.mongodb.net/")
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(5000, (err) => {
      if (err) {
        console.error("Server startup error:", err);
      } else {
        console.log("Server running on port 5000");
      }
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });