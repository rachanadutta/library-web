// ─────────────────────────────────────────────
//  Library Management System — Backend Server
//  Stack: Node.js (v22+) + Express + SQLite
//  Note: Uses Node's built-in SQLite (no install needed)
// ─────────────────────────────────────────────

const express    = require("express");
const cors       = require("cors");

// Built-in SQLite module (Node.js v22.5+, no npm package needed)
// Run with: node --experimental-sqlite server.js
const { DatabaseSync } = require("node:sqlite");

const app  = express();
const PORT = 3000;

// ── Middleware ────────────────────────────────
app.use(cors());               // Allow requests from the frontend
app.use(express.json());       // Parse JSON request bodies

// ── Database Setup ────────────────────────────
// Creates library.db file automatically on first run
const db = new DatabaseSync("library.db");

// Create tables if they don't exist yet
db.exec(`
  CREATE TABLE IF NOT EXISTS books (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    title    TEXT    NOT NULL,
    author   TEXT    NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS students (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT NOT NULL,
    department TEXT NOT NULL
  );

  -- Tracks which student has issued which book
  CREATE TABLE IF NOT EXISTS issued_books (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    book_id    INTEGER NOT NULL,
    FOREIGN KEY (student_id) REFERENCES students(id),
    FOREIGN KEY (book_id)    REFERENCES books(id)
  );
`);

// ═══════════════════════════════════════════
//  BOOK ROUTES  (Librarian features)
// ═══════════════════════════════════════════

// GET /books — fetch all books
app.get("/books", (req, res) => {
  const books = db.prepare("SELECT * FROM books").all();
  res.json(books);
});

// POST /books — add a new book
app.post("/books", (req, res) => {
  const { title, author, quantity } = req.body;

  // Basic validation
  if (!title || !author || !quantity) {
    return res.status(400).json({ error: "title, author and quantity are required" });
  }

  const stmt   = db.prepare("INSERT INTO books (title, author, quantity) VALUES (?, ?, ?)");
  const result = stmt.run(title, author, Number(quantity));
  res.json({ message: "Book added successfully", id: result.lastInsertRowid });
});

// DELETE /books/:id — remove a book
app.delete("/books/:id", (req, res) => {
  const { id } = req.params;

  // Don't allow deleting a book that is currently issued
  const issuedCount = db.prepare("SELECT COUNT(*) as cnt FROM issued_books WHERE book_id = ?").get(id).cnt;
  if (issuedCount > 0) {
    return res.status(400).json({ error: "Cannot delete a book that is currently issued to students." });
  }

  db.prepare("DELETE FROM books WHERE id = ?").run(id);
  res.json({ message: "Book deleted successfully" });
});

app.get("/students/:id/books", (req, res) => {

  const studentId = req.params.id;

  db.all(

    `
    SELECT books.*
    FROM issued_books
    JOIN books
      ON issued_books.book_id = books.id
    WHERE issued_books.student_id = ?
    `,

    [studentId],

    (err, rows) => {

      if(err) {

        return res.status(500).json({
          error: err.message
        });
      }

      res.json(rows);
    }
  );
});

// ═══════════════════════════════════════════
//  STUDENT ROUTES  (Librarian features)
// ═══════════════════════════════════════════

// GET /students — fetch all students
app.get("/students", (req, res) => {
  const students = db.prepare("SELECT * FROM students").all();
  res.json(students);
});

// POST /students — register a new student
app.post("/students", (req, res) => {
  const { name, department } = req.body;

  if (!name || !department) {
    return res.status(400).json({ error: "name and department are required" });
  }

  const stmt   = db.prepare("INSERT INTO students (name, department) VALUES (?, ?)");
  const result = stmt.run(name, department);
  res.json({ message: "Student registered successfully", id: result.lastInsertRowid });
});

// DELETE /students/:id — remove a student
app.delete("/students/:id", (req, res) => {
  const { id } = req.params;

  // Don't delete if they have books issued
  const issuedCount = db.prepare("SELECT COUNT(*) as cnt FROM issued_books WHERE student_id = ?").get(id).cnt;
  if (issuedCount > 0) {
    return res.status(400).json({ error: "Student has issued books. Please return them first." });
  }

  db.prepare("DELETE FROM students WHERE id = ?").run(id);
  res.json({ message: "Student removed successfully" });
});

// ═══════════════════════════════════════════
//  ISSUE / RETURN ROUTES
// ═══════════════════════════════════════════

// POST /issue — issue a book to a student
app.post("/issue", (req, res) => {
  const { student_id, book_id } = req.body;

  // Check student exists
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(student_id);
  if (!student) return res.status(404).json({ error: "Student not found." });

  // Check book exists
  const book = db.prepare("SELECT * FROM books WHERE id = ?").get(book_id);
  if (!book) return res.status(404).json({ error: "Book not found." });

  // Check availability
  if (book.quantity < 1) {
    return res.status(400).json({ error: "Book is currently unavailable." });
  }

  // Check if student already has this book
  const alreadyIssued = db.prepare(
    "SELECT * FROM issued_books WHERE student_id = ? AND book_id = ?"
  ).get(student_id, book_id);
  if (alreadyIssued) {
    return res.status(400).json({ error: "Student already has this book issued." });
  }

  // Limit: max 3 books per student
  const issuedCount = db.prepare(
    "SELECT COUNT(*) as cnt FROM issued_books WHERE student_id = ?"
  ).get(student_id).cnt;
  if (issuedCount >= 3) {
    return res.status(400).json({ error: "Student cannot issue more than 3 books." });
  }

  // All checks passed — issue the book
  db.prepare("INSERT INTO issued_books (student_id, book_id) VALUES (?, ?)").run(student_id, book_id);
  db.prepare("UPDATE books SET quantity = quantity - 1 WHERE id = ?").run(book_id);

  res.json({ message: `Book "${book.title}" issued to ${student.name} successfully.` });
});

// POST /return — return a book from a student
app.post("/return", (req, res) => {
  const { student_id, book_id } = req.body;

  // Check the issue record exists
  const record = db.prepare(
    "SELECT * FROM issued_books WHERE student_id = ? AND book_id = ?"
  ).get(student_id, book_id);

  if (!record) {
    return res.status(400).json({ error: "This book was not issued to this student." });
  }

  // Remove issue record and restore quantity
  db.prepare("DELETE FROM issued_books WHERE student_id = ? AND book_id = ?").run(student_id, book_id);
  db.prepare("UPDATE books SET quantity = quantity + 1 WHERE id = ?").run(book_id);

  const book    = db.prepare("SELECT * FROM books WHERE id = ?").get(book_id);
  const student = db.prepare("SELECT * FROM students WHERE id = ?").get(student_id);
  res.json({ message: `Book "${book.title}" returned by ${student.name} successfully.` });
});

// GET /issued — list all currently issued books with student & book details
app.get("/issued", (req, res) => {
  const rows = db.prepare(`
    SELECT 
      ib.id,
      s.id   AS student_id,
      s.name AS student_name,
      s.department,
      b.id   AS book_id,
      b.title,
      b.author
    FROM issued_books ib
    JOIN students s ON ib.student_id = s.id
    JOIN books    b ON ib.book_id    = b.id
  `).all();
  res.json(rows);
});

// ── Start Server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Library backend running at http://localhost:${PORT}`);
});
