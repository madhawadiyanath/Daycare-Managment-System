const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

mongoose.connect("mongodb+srv://<db_username>:ywGSaGThVLxZvnQr@cluster0.sfvhdit.mongodb.net/")

//OwdDd9kgZqpGWWA8