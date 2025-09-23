const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const userRoutes = require("./routes/userRoute");
const transactionRoutes = require("./routes/transactionRoute");
const salaryRoutes = require("./routes/salaryRoute");
const adminRoutes = require("./routes/adminRoute");
const financeManagerRoutes = require("./routes/financeManagerRoute");
const teacherRoutes = require("./routes/teacherRoute");
const { createDefaultAdmin } = require("./models/AdminModel");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/transactions", transactionRoutes);
app.use("/salaries", salaryRoutes);
app.use("/admin", adminRoutes);
app.use("/admin/finance-managers", financeManagerRoutes);
app.use("/admin/teachers", teacherRoutes);

app.get("/", (req, res) => {
  res.send("Finance Management System is working");
});

// Error handling middleware for JSON parsing errors
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError) {
    res.status(400).json({ 
      error: "Invalid JSON format in request body",
      details: error.message 
    });
  } else {
    next(error);
  }
});

// MongoDB connection
mongoose.connect("mongodb+srv://admin:5YdcKV1qUqM18Gkv@cluster0.8kk63n7.mongodb.net/finance_db?retryWrites=true&w=majority")
  .then(() => {
    console.log("Connected to MongoDB");
    
    // Create default admin user if not exists
    createDefaultAdmin().then(() => {
      console.log('Admin initialization complete');
    });
    
    app.listen(5000, () => {
      console.log("Server running on port 5000");
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
  });