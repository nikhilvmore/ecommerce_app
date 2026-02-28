import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcryptjs";

const db = new Database("ecommerce.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT,
    role TEXT CHECK(role IN ('merchant', 'customer'))
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    price REAL,
    imageUrl TEXT,
    merchantId INTEGER,
    FOREIGN KEY(merchantId) REFERENCES users(id)
  );
`);

const app = express();
app.use(express.json());

const PORT = 3000;

// Auth Routes
app.post("/api/register", async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const info = db.prepare("INSERT INTO users (username, password, role) VALUES (?, ?, ?)").run(username, hashedPassword, role);
    res.json({ id: info.lastInsertRowid, username, role });
  } catch (e) {
    res.status(400).json({ error: "Username already exists" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
  if (user && await bcrypt.compare(password, user.password)) {
    res.json({ id: user.id, username: user.username, role: user.role });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// Product Routes
app.get("/api/products", (req, res) => {
  const products = db.prepare("SELECT * FROM products").all();
  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, description, price, imageUrl, merchantId } = req.body;
  const info = db.prepare("INSERT INTO products (name, description, price, imageUrl, merchantId) VALUES (?, ?, ?, ?, ?)").run(name, description, price, imageUrl, merchantId);
  res.json({ id: info.lastInsertRowid, name, description, price, imageUrl });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile(path.resolve("dist/index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
