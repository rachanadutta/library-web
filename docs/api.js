// ─────────────────────────────────────────────────────────────
//  api.js — Shared helper used by both librarian.js & student.js
// ─────────────────────────────────────────────────────────────

// Change this to your Render URL after deployment
// e.g.  const API = "https://my-library-backend.onrender.com";
const API = "https://library-web-cflq.onrender.com";

/**
 * showMessage — displays a success or error message inside a DOM element.
 * @param {string} elementId - the id of the <div class="message"> element
 * @param {string} text      - message text to show
 * @param {boolean} isError  - true = red (error), false = green (success)
 */
function showMessage(elementId, text, isError = false) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.textContent    = text;
  el.className      = "message " + (isError ? "error" : "success");

  // Auto-clear the message after 4 seconds
  setTimeout(() => { el.textContent = ""; el.className = "message"; }, 4000);
}

/**
 * buildTable — generates an HTML <table> from an array of objects.
 * @param {Object[]} rows       - data rows
 * @param {string[]} columns    - column keys to display
 * @param {string[]} headers    - human-readable column header labels
 * @param {Function} [extraCol] - optional function(row) returning extra <td> HTML
 */
function buildTable(rows, columns, headers, extraCol = null) {
  if (!rows || rows.length === 0) {
    return "<p style='color:#888;margin-top:10px'>No records found.</p>";
  }

  // Build header row
  let html = "<table><thead><tr>";
  headers.forEach(h => { html += `<th>${h}</th>`; });
  if (extraCol) html += "<th>Action</th>";
  html += "</tr></thead><tbody>";

  // Build data rows
  rows.forEach(row => {
    html += "<tr>";
    columns.forEach(col => { html += `<td>${row[col] ?? ""}</td>`; });
    if (extraCol) html += `<td>${extraCol(row)}</td>`;
    html += "</tr>";
  });

  html += "</tbody></table>";
  return html;
}
