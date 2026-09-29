// Fixed category list and validation logic - the guardrail for AI output.
export const CATEGORIES = [
  "Food",
  "Travel",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Other",
];

// Checks that a parsed expense object is safe to save.
// Returns { valid: true, data } or { valid: false, error }.
export function validateExpense(obj) {
  if (!obj || typeof obj !== "object") {
    return { valid: false, error: "Response was not a JSON object." };
  }

  const { amount, category, date, note } = obj;

  const numericAmount = Number(amount);
  if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
    return { valid: false, error: "amount must be a positive number." };
  }

  if (typeof category !== "string" || !CATEGORIES.includes(category)) {
    return {
      valid: false,
      error: `category must be one of: ${CATEGORIES.join(", ")}`,
    };
  }

  const dateOk = typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date);
  if (!dateOk || Number.isNaN(new Date(date).getTime())) {
    return { valid: false, error: "date must be a valid YYYY-MM-DD string." };
  }

  return {
    valid: true,
    data: {
      amount: numericAmount,
      category,
      date,
      note: typeof note === "string" ? note.slice(0, 200) : "",
    },
  };
}