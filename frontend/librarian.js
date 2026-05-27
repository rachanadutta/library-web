// ────────────────────────────────────────────────────────
//  librarian.js — JavaScript for the Librarian Panel page
//  Uses fetch() to call the REST API (defined in server.js)
// ────────────────────────────────────────────────────────

// ── Load all books and display in a table ────────────────
async function loadBooks() {
  const res   = await fetch(`${API}/books`);
  const books = await res.json();

  // Build table with a Delete button in the last column
  document.getElementById("booksTable").innerHTML = buildTable(
    books,
    ["id", "title", "author", "quantity"],
    ["ID", "Title", "Author", "Qty Available"],
    row => `<button class="btn btn-red btn-sm" onclick="deleteBook(${row.id})">🗑 Delete</button>`
  );
}

// ── Add a new book ───────────────────────────────────────
async function addBook() {
  const title    = document.getElementById("bookTitle").value.trim();
  const author   = document.getElementById("bookAuthor").value.trim();
  const quantity = document.getElementById("bookQuantity").value;

  if (!title || !author || !quantity) {
    return showMessage("addBookMsg", "Please fill in all fields.", true);
  }

  // POST request to /books
  const res  = await fetch(`${API}/books`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, author, quantity: Number(quantity) })
  });
  const data = await res.json();

  if (res.ok) {
    showMessage("addBookMsg", data.message);
    // Clear inputs and refresh the book list
    document.getElementById("bookTitle").value    = "";
    document.getElementById("bookAuthor").value   = "";
    document.getElementById("bookQuantity").value = "";
    loadBooks();
  } else {
    showMessage("addBookMsg", data.error, true);
  }
}

// ── Delete a book by ID ──────────────────────────────────
async function deleteBook(id) {
  if (!confirm("Are you sure you want to delete this book?")) return;

  const res  = await fetch(`${API}/books/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (res.ok) {
    loadBooks(); // Refresh table
  } else {
    alert(data.error);
  }
}

// ── Load all students and display in a table ─────────────
async function loadStudents() {
  const res      = await fetch(`${API}/students`);
  const students = await res.json();

  document.getElementById("studentsTable").innerHTML = buildTable(
    students,
    ["id", "name", "department"],
    ["ID", "Name", "Department"],
    row => `<button class="btn btn-red btn-sm" onclick="deleteStudent(${row.id})">🗑 Remove</button>`
  );
}

// ── Register a new student ───────────────────────────────
async function addStudent() {
  const name       = document.getElementById("studentName").value.trim();
  const department = document.getElementById("studentDept").value.trim();

  if (!name || !department) {
    return showMessage("addStudentMsg", "Please fill in all fields.", true);
  }

  // POST request to /students
  const res  = await fetch(`${API}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, department })
  });
  const data = await res.json();

  if (res.ok) {
    showMessage("addStudentMsg", `${data.message} (Student ID: ${data.id})`);
    document.getElementById("studentName").value = "";
    document.getElementById("studentDept").value = "";
    loadStudents();
  } else {
    showMessage("addStudentMsg", data.error, true);
  }
}

// ── Delete a student by ID ───────────────────────────────
async function deleteStudent(id) {
  if (!confirm("Remove this student from the system?")) return;

  const res  = await fetch(`${API}/students/${id}`, { method: "DELETE" });
  const data = await res.json();

  if (res.ok) {
    loadStudents();
  } else {
    alert(data.error);
  }
}

// ── Issue a book to a student ────────────────────────────
async function issueBook() {
  const student_id = document.getElementById("issueStudentId").value;
  const book_id    = document.getElementById("issueBookId").value;

  if (!student_id || !book_id) {
    return showMessage("issueMsg", "Please enter both Student ID and Book ID.", true);
  }

  // POST request to /issue
  const res  = await fetch(`${API}/issue`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: Number(student_id), book_id: Number(book_id) })
  });
  const data = await res.json();

  if (res.ok) {
    showMessage("issueMsg", data.message);
    document.getElementById("issueStudentId").value = "";
    document.getElementById("issueBookId").value    = "";
    loadBooks();    // Qty will decrease
    loadIssued();   // Show in issued log
  } else {
    showMessage("issueMsg", data.error, true);
  }
}

// ── Return a book from a student ─────────────────────────
async function returnBook() {
  const student_id = document.getElementById("returnStudentId").value;
  const book_id    = document.getElementById("returnBookId").value;

  if (!student_id || !book_id) {
    return showMessage("returnMsg", "Please enter both Student ID and Book ID.", true);
  }

  // POST request to /return
  const res  = await fetch(`${API}/return`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ student_id: Number(student_id), book_id: Number(book_id) })
  });
  const data = await res.json();

  if (res.ok) {
    showMessage("returnMsg", data.message);
    document.getElementById("returnStudentId").value = "";
    document.getElementById("returnBookId").value    = "";
    loadBooks();   // Qty will increase
    loadIssued();  // Remove from issued log
  } else {
    showMessage("returnMsg", data.error, true);
  }
}

// ── Load all currently issued books ─────────────────────
async function loadIssued() {
  const res    = await fetch(`${API}/issued`);
  const issued = await res.json();

  document.getElementById("issuedTable").innerHTML = buildTable(
    issued,
    ["student_id", "student_name", "department", "book_id", "title", "author"],
    ["Student ID", "Student Name", "Dept", "Book ID", "Book Title", "Author"]
  );
}
