const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// User routes
router.get("/", userController.getAllUsers);
router.post("/register", userController.register);
router.get("/:id", userController.getById);
router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);
router.get("/:id/balance", userController.getBalance);
router.post("/:id/balance", userController.updateBalance);

module.exports = router;