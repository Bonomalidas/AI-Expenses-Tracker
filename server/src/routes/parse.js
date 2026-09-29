// POST /api/parse - takes natural language text, returns structured expense data
import express from "express";
import { validateExpense } from "../lib/validator.js";

export const parseRouter = express.Router();

const CATEGORIES = ["Food", "Travel", "Shopping", "Bills", "Entertainment", "Health", "Other"];

function buildPrompt(text, today) {
  return `You are an expense-extraction assistant. Extract expense details from the user's message and return ONLY a JSON object, nothing else - no markdown, no explanation, no code fences.

Today's date is ${today} (YYYY-MM-DD). Resolve relative dates like "yesterday" or "today" using this.

Return exactly this shape:
{"amount": number, "category": one of [${CATEGORIES.join(", ")}], "date": "YYYY-MM-DD", "note": short string}

User message: "${text}"`;
}

async function callGroq(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  const url = "https://api.groq.com/openai/v1/chat/completions";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Groq API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

function extractJson(rawText) {
  const cleaned = rawText.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

parseRouter.post("/", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Please provide expense text." });
    }

    const today = new Date().toISOString().slice(0, 10);
    const prompt = buildPrompt(text, today);

    let parsed;
    try {
      const rawText = await callGroq(prompt);
      parsed = extractJson(rawText);
    } catch (err) {
      console.error("Groq call/parse failed:", err.message);
      return res.status(502).json({ error: "AI could not process this text. Try rephrasing." });
    }

    const result = validateExpense(parsed);
    if (!result.valid) {
      return res.status(422).json({ error: `AI output was invalid: ${result.error}` });
    }

    res.json(result.data);
  } catch (err) {
    console.error("POST /parse error:", err.message);
    res.status(500).json({ error: "Something went wrong." });
  }
});