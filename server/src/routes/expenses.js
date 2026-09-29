// CRUD routes for expenses: GET (list + one), POST, PUT, DELETE
import express from "express";
import { Expense } from "../models.js";

export const expensesRouter = express.Router();

// GET /api/expenses - list all, newest first
// Supports optional ?category=Food and ?month=2026-09 filters
expensesRouter.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) {
      filter.category = req.query.category;
    }
    if (req.query.month) {
      // "2026-09" -> from 2026-09-01 to 2026-10-01 (exclusive)
      const [year, month] = req.query.month.split("-").map(Number);
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 1);
      filter.date = { $gte: start, $lt: end };
    }

    const expenses = await Expense.find(filter).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    console.error("GET /expenses error:", err.message);
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

// GET /api/expenses/:id - get a single expense
expensesRouter.get("/:id", async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) {
      return res.status(404).json({ error: "Expense not found." });
    }
    res.json(expense);
  } catch (err) {
    // CastError happens when :id isn't a valid MongoDB ObjectId
    res.status(400).json({ error: "Invalid expense id." });
  }
});

// POST /api/expenses - create a new expense directly (already-structured data)
expensesRouter.post("/", async (req, res) => {
  try {
    const { amount, category, date, note } = req.body;
    const expense = await Expense.create({ amount, category, date, note });
    res.status(201).json(expense);
  } catch (err) {
    // Mongoose validation errors (bad enum, negative amount, etc.)
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/expenses/:id - update an existing expense
expensesRouter.put("/:id", async (req, res) => {
  try {
    const { amount, category, date, note } = req.body;
    const updated = await Expense.findByIdAndUpdate(
      req.params.id,
      { amount, category, date, note },
      { new: true, runValidators: true } // return updated doc, re-run schema checks
    );
    if (!updated) {
      return res.status(404).json({ error: "Expense not found." });
    }
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/expenses/:id
expensesRouter.delete("/:id", async (req, res) => {
  try {
    const deleted = await Expense.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Expense not found." });
    }
    res.json({ message: "Deleted.", id: req.params.id });
  } catch (err) {
    res.status(400).json({ error: "Invalid expense id." });
  }
});