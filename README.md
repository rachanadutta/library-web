# 📚 Library Management System — Web App

A simple full-stack web application built with **Node.js + Express + SQLite** (backend) and **HTML + CSS + Vanilla JavaScript** (frontend).

> **No native dependencies!** Uses Node.js v22's built-in SQLite module — just install `express` and `cors`.

---

## 📁 Folder Structure

```
library-web/
├── backend/
│   ├── server.js        ← Express server + all API routes
│   ├── package.json     ← Node dependencies (only express + cors)
│   └── library.db       ← Auto-created SQLite database (on first run)
└── frontend/
    ├── index.html       ← Home page (role selection)
    ├── librarian.html   ← Librarian panel
    ├── student.html     ← Student portal
    ├── style.css        ← All styles
    ├── api.js           ← Shared fetch helpers
    ├── librarian.js     ← Librarian page logic
    └── student.js       ← Student page logic
```

---

## ✅ Features

| Feature            | Librarian | Student |
|--------------------|:---------:|:-------:|
| Add book           | ✅        |         |
| Delete book        | ✅        |         |
| View all books     | ✅        | ✅      |
| Register student   | ✅        | ✅ (self)|
| Remove student     | ✅        |         |
| Issue book         | ✅        | ✅      |
| Return book        | ✅        | ✅      |
| View issued log    | ✅        |         |

---

## 🚀 How to Run Locally

### Requirements
- **Node.js v22 or later** (for the built-in SQLite module)
- Check your version: `node -v`

### 1. Install dependencies

Open a terminal inside the `backend/` folder:

```bash
cd backend
npm install
```

This only installs `express` and `cors` — SQLite is built into Node 22, no extra install needed!

### 2. Start the backend server

```bash
npm start
```

This runs: `node --experimental-sqlite server.js`

You should see:
```
✅ Library backend running at http://localhost:3000
```

The `library.db` file is created automatically on first run.

### 3. Open the frontend

You **don't need a frontend server**. Just open the HTML files in your browser:

- Double-click `frontend/index.html`, **or**
- In VS Code: right-click → "Open with Live Server"

> ⚠️ Make sure the backend is running before using the frontend.

---

## 🌐 REST API Reference

| Method | Endpoint        | Description                            |
|--------|-----------------|----------------------------------------|
| GET    | /books          | Get all books                          |
| POST   | /books          | Add a book `{title, author, quantity}` |
| DELETE | /books/:id      | Delete a book                          |
| GET    | /students       | Get all students                       |
| POST   | /students       | Register student `{name, department}`  |
| DELETE | /students/:id   | Remove a student                       |
| POST   | /issue          | Issue book `{student_id, book_id}`     |
| POST   | /return         | Return book `{student_id, book_id}`    |
| GET    | /issued         | List all currently issued books        |

---

## ☁️ Deploy Backend on Render (Free)

1. Push your `backend/` folder to a **GitHub repository**.

2. Go to [https://render.com](https://render.com) and sign in.

3. Click **"New +"** → **"Web Service"**.

4. Connect your GitHub repo.

5. Fill in the settings:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** `Node`

6. Click **Deploy**. Render gives you a URL like:
   ```
   https://my-library-backend.onrender.com
   ```

7. Update `frontend/api.js` — change the `API` constant:
   ```js
   const API = "https://my-library-backend.onrender.com";
   ```

> ⚠️ On Render's free tier, the server sleeps after inactivity. First request may take ~30 seconds.

> ⚠️ Render's free tier doesn't persist files between deploys. For a persistent database, upgrade to a paid plan or use a hosted database like Turso (free SQLite hosting).

---

## 🌍 Deploy Frontend on GitHub Pages

1. Push the `frontend/` folder contents to a GitHub repo.

2. Go to the repo → **Settings** → **Pages**.

3. Under **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)` or `/docs`

4. Click **Save**. Your site will be at:
   ```
   https://your-username.github.io/your-repo-name/
   ```

5. Make sure `api.js` already points to your Render backend URL.

---

## 📝 Notes for College Viva

- **No login/JWT** — roles are selected on the home page, keeping code simple.
- **SQLite** stores data in a single file `library.db` — no database server needed.
- **REST API** uses standard HTTP verbs: GET, POST, DELETE.
- **fetch()** in the frontend replaces older AJAX — modern and beginner-friendly.
- Business rules from the original Java project are fully preserved:
  - A student can issue max **3 books** at a time.
  - A book cannot be deleted while it's currently issued.
  - A student cannot be removed while they have issued books.
  - A book cannot be issued if quantity is 0.
