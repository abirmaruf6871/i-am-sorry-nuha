const GIST_ID = process.env.GIST_ID || "8fd709c237749925282ffba6ae9aced0";
const ADMIN_KEY = process.env.ADMIN_KEY || "nuha-admin";
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,x-admin-key");
}

async function readGist() {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "User-Agent": "nuha-date-app"
    }
  });
  if (!res.ok) throw new Error(`Gist read failed: ${res.status}`);
  const data = await res.json();
  const file = data.files["responses.json"] || Object.values(data.files)[0];
  return JSON.parse(file.content || "[]");
}

async function writeGist(list) {
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`, {
    method: "PATCH",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
      "User-Agent": "nuha-date-app"
    },
    body: JSON.stringify({
      files: {
        "responses.json": {
          content: JSON.stringify(list, null, 2)
        }
      }
    })
  });
  if (!res.ok) throw new Error(`Gist write failed: ${res.status}`);
}

function isAdmin(req) {
  const key = req.headers["x-admin-key"] || (req.query && req.query.key);
  return key === ADMIN_KEY;
}

module.exports = async function handler(req, res) {
  cors(res);
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: "Server missing GITHUB_TOKEN" });
  }

  try {
    if (req.method === "POST") {
      const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
      const { saidYes, place, venue, when, date, time, step } = body;
      if (!step) return res.status(400).json({ error: "Missing step" });

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
        userAgent: String(req.headers["user-agent"] || "").slice(0, 200)
      };

      const list = await readGist();
      list.unshift(entry);
      await writeGist(list.slice(0, 500));
      return res.status(200).json({ ok: true, id: entry.id });
    }

    if (req.method === "GET") {
      if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      const responses = await readGist();
      return res.status(200).json({ ok: true, responses });
    }

    if (req.method === "DELETE") {
      if (!isAdmin(req)) return res.status(401).json({ error: "Unauthorized" });
      await writeGist([]);
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    return res.status(500).json({ error: err.message || "Server error" });
  }
};
