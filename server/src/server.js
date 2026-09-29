import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { connectDb } from "./lib/db.js";
import { expensesRouter } from "./routes/expenses.js";
import { parseRouter } from "./routes/parse.js";

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
app.use(express.json());

// Basic protection: max 100 requests per IP per 15 minutes
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", limiter);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/expenses", expensesRouter);
app.use("/api/parse", parseRouter);

const PORT = process.env.PORT || 5000;

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});