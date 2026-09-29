import { useState, useEffect } from "react";

function App() {
  const [expenses, setExpenses] = useState([]);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [note, setNote] = useState("");
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  const fetchExpenses = async () => {
    const res = await fetch("http://localhost:5000/api/expenses");
    const data = await res.json();
    setExpenses(data);
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch("http://localhost:5000/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: Number(amount), category, note }),
    });
    setAmount("");
    setCategory("");
    setNote("");
    fetchExpenses();
  };

  const handleDelete = async (id) => {
    await fetch(`http://localhost:5000/api/expenses/${id}`, {
      method: "DELETE",
    });
    fetchExpenses();
  };

  const handleAiSubmit = async (e) => {
    e.preventDefault();
    setAiLoading(true);
    setAiError("");
    try {
      const parseRes = await fetch("http://localhost:5000/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: aiText }),
      });

      if (!parseRes.ok) throw new Error("Parsing failed");
      const parsed = await parseRes.json();

      await fetch("http://localhost:5000/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed),
      });

      setAiText("");
      fetchExpenses();
    } catch (err) {
      setAiError("Couldn't parse that. Try rephrasing.");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6">
      <h1 className="text-2xl font-bold mb-4">Expense Tracker</h1>

      <form onSubmit={handleAiSubmit} className="flex flex-col gap-2 mb-6 bg-gray-50 p-4 rounded">
        <label className="text-sm font-semibold text-gray-600">Quick add (AI)</label>
        <input
          type="text"
          placeholder='e.g. "spent 250 on pizza yesterday"'
          value={aiText}
          onChange={(e) => setAiText(e.target.value)}
          className="border rounded p-2"
        />
        <button
          type="submit"
          disabled={aiLoading}
          className="bg-purple-600 text-white rounded p-2 disabled:opacity-50"
        >
          {aiLoading ? "Parsing..." : "Add with AI"}
        </button>
        {aiError && <p className="text-red-600 text-sm">{aiError}</p>}
      </form>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3 mb-6">
        <label className="text-sm font-semibold text-gray-600">Manual add</label>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="border rounded p-2"
          required
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2"
        />
        <input
          type="text"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="border rounded p-2"
        />
        <button type="submit" className="bg-blue-600 text-white rounded p-2">
          Add Expense
        </button>
      </form>

      <ul className="flex flex-col gap-2">
        {expenses.map((exp) => (
          <li key={exp._id} className="border rounded p-2 flex justify-between items-center">
            <span>{exp.category}: ₹{exp.amount} ({exp.note})</span>
            <button onClick={() => handleDelete(exp._id)} className="text-red-600 text-sm">
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
