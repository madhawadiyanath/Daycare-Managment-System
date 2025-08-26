const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const router=require("./Routes/userRoutes");
const app = express();


app.use("/users",router);
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("It is working");
});

// Test connection without starting server first
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