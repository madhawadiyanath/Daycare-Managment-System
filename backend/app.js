const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Daycare Finance Management System is working");
});

// MongoDB connection
mongoose.connect("mongodb+srv://admin:5YdcKV1qUqM18Gkv@cluster0.8kk63n7.mongodb.net/daycare_db?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");
    
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });