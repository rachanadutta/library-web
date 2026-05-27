// ──────────────────────────────────────────────────────────
//  student.js — JavaScript for the Student Portal page
//  Uses fetch() to call the REST API (defined in server.js)
// ──────────────────────────────────────────────────────────

// ── Load all available books ─────────────────────────────
async function loadBooks() {
  const res   = await fetch(`${API}/books`);
  const books = await res.json();

  // Show all books; highlight if quantity is 0 (unavailable)
  const rows = books.map(b => ({
    ...b,
    quantity: b.quantity > 0 ? b.quantity : "❌ Unavailable"
  }));

  document.getElementById("booksTable").innerHTML = buildTable(
    rows,
    ["id", "title", "author", "quantity"],
    ["Book ID", "Title", "Author", "Available Qty"]
  );
}

// ── Register (self-register as a student) ────────────────
async function registerStudent() {
  const name       = document.getElementById("studentName").value.trim();
  const department = document.getElementById("studentDept").value.trim();

  if (!name || !department) {
    return showMessage("registerMsg", "Please enter your name and department.", true);
  }

  // POST request to /students
  const res  = await fetch(`${API}/students`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, department })
  });
  const data = await res.json();

  if (res.ok) {
    // Show the assigned Student ID — student will need it to issue/return books
    showMessage("registerMsg", `✅ Registered! Your Student ID is: ${data.id}. Save this ID.`);
    document.getElementById("studentName").value = "";
    document.getElementById("studentDept").value = "";
  } else {
    showMessage("registerMsg", data.error, true);
  }
}

// ── Issue a book ─────────────────────────────────────────
async function issueBook() {
  const student_id = document.getElementById("issueStudentId").value;
  const book_id    = document.getElementById("issueBookId").value;

  if (!student_id || !book_id) {
    return showMessage("issueMsg", "Please enter your Student ID and the Book ID.", true);
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
    loadBooks(); // Refresh to show updated quantity
  } else {
    showMessage("issueMsg", data.error, true);
  }
}

// ── Return a book ────────────────────────────────────────
async function returnBook() {
  const student_id = document.getElementById("returnStudentId").value;
  const book_id    = document.getElementById("returnBookId").value;

  if (!student_id || !book_id) {
    return showMessage("returnMsg", "Please enter your Student ID and the Book ID.", true);
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
    loadBooks(); // Refresh to show updated quantity
  } else {
    showMessage("returnMsg", data.error, true);
  }
}
