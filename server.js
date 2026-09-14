const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || "nuha-admin";
const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "responses.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");

function readResponses() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
  } catch {
    return [];
  }
}

function writeResponses(list) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(list, null, 2), "utf8");
}

app.use(cors());
app.use(express.json({ limit: "32kb" }));
app.use(express.static(__dirname));

function requireAdmin(req, res, next) {
  const key = req.headers["x-admin-key"] || req.query.key;
  if (key !== ADMIN_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.post("/api/responses", (req, res) => {
  const { saidYes, place, venue, when, date, time, step } = req.body || {};
  if (!step) {
    return res.status(400).json({ error: "Missing step" });
  }

  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    at: new Date().toISOString(),
    step: String(step),
    saidYes: Boolean(saidYes),
    place: place ? String(place).slice(0, 120) : null,
    venue: venue ? String(venue).slice(0, 120) : null,
    date: date ? String(date).slice(0, 120) : null,
    time: time ? String(time).slice(0, 80) : null,
    when: when ? String(when).slice(0, 180) : null,
    userAgent: (req.headers["user-agent"] || "").slice(0, 200)
  };

  const list = readResponses();
  list.unshift(entry);
  writeResponses(list.slice(0, 500));
  res.json({ ok: true, id: entry.id });
});

app.get("/api/responses", requireAdmin, (req, res) => {
  res.json({ ok: true, responses: readResponses() });
});

app.delete("/api/responses", requireAdmin, (req, res) => {
  writeResponses([]);
  res.json({ ok: true });
});

app.get("/admin", (req, res) => {
  res.sendFile(path.join(__dirname, "admin.html"));
});

app.listen(PORT, () => {
  console.log(`Date app running at http://localhost:${PORT}`);
  console.log(`Admin panel:     http://localhost:${PORT}/admin?key=${ADMIN_KEY}`);
});
