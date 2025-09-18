const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User routes
router.get("/", userController.getAllUsers);
router.post("/", userController.register);
router.post("/login", userController.login);
router.get("/:username", userController.getUserByUsername);
router.put("/:username", userController.updateUser);
router.delete("/:username", userController.deleteUser);

module.exports = router;