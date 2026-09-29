// Defines the shape of an expense document in MongoDB.
import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: [0.01, "amount must be greater than 0"],
  },
  category: {
    type: String,
    required: true,
    enum: ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"],
  },
  date: {
    type: Date,
    required: true,
  },
  note: {
    type: String,
    default: "",
    maxlength: 200,
  },
}, { timestamps: true }); // adds createdAt and updatedAt automatically

// Index for fast queries when filtering/summing by date and category
expenseSchema.index({ date: 1, category: 1 });

export const Expense = mongoose.model("Expense", expenseSchema);