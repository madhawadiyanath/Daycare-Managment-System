const express = require("express");
const router = express.Router();
const salaryController = require("../controllers/salaryController");

// Salary routes
router.get("/", salaryController.getAllSalaries);
router.post("/", salaryController.createSalary);
router.get("/:id", salaryController.getSalaryById);
router.put("/:id", salaryController.updateSalary);
router.delete("/:id", salaryController.deleteSalary);
router.get("/employee/:empID", salaryController.getSalariesByEmpId);

module.exports = router;
