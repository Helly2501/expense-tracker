const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Database setup ---
const db = new Database('expenses.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS expenses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    amount REAL NOT NULL,
    category TEXT NOT NULL DEFAULT 'Other',
    date TEXT NOT NULL DEFAULT (date('now'))
  )
`);

// --- Validation helper ---
function validate(body) {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
    errors.push('title is required');
  }
  const amount = Number(body.amount);
  if (body.amount === undefined || Number.isNaN(amount) || amount <= 0) {
    errors.push('amount must be a number greater than 0');
  }
  return errors;
}

// --- Routes ---
app.get('/', (req, res) => {
  res.json({ message: 'Expense Tracker API is running' });
});

// Get all expenses (optional ?category=Food)
app.get('/api/expenses', (req, res) => {
  const { category } = req.query;

  const rows = category
    ? db.prepare('SELECT * FROM expenses WHERE category = ? ORDER BY date DESC, id DESC').all(category)
    : db.prepare('SELECT * FROM expenses ORDER BY date DESC, id DESC').all();

  res.json(rows);
});

// Summary: total and total per category
// (must stay ABOVE the /:id route below)
app.get('/api/expenses/summary', (req, res) => {
  const total = db
    .prepare('SELECT COALESCE(SUM(amount), 0) AS total FROM expenses')
    .get().total;

  const byCategory = db
    .prepare('SELECT category, SUM(amount) AS total FROM expenses GROUP BY category ORDER BY total DESC')
    .all();

  res.json({ total, byCategory });
});

// Create an expense
app.post('/api/expenses', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const { title, amount, category = 'Other' } = req.body;

  const result = db
    .prepare('INSERT INTO expenses (title, amount, category) VALUES (?, ?, ?)')
    .run(title.trim(), Number(amount), category);

  const created = db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(created);
});

// Get one expense
app.get('/api/expenses/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  if (!row) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.json(row);
});

// Update an expense
app.put('/api/expenses/:id', (req, res) => {
  const errors = validate(req.body);
  if (errors.length) {
    return res.status(400).json({ errors });
  }

  const { title, amount, category = 'Other' } = req.body;

  const result = db
    .prepare('UPDATE expenses SET title = ?, amount = ?, category = ? WHERE id = ?')
    .run(title.trim(), Number(amount), category, req.params.id);

  if (result.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }

  const updated = db.prepare('SELECT * FROM expenses WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// Delete an expense
app.delete('/api/expenses/:id', (req, res) => {
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
  if (result.changes === 0) {
    return res.status(404).json({ error: 'Expense not found' });
  }
  res.status(204).send();
});

// --- Start server (always last) ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});