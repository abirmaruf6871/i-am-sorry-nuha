const locations = [
  { id: "rooftop", emoji: "🌃", title: "Restaurant Rooftop", text: "stars, skyline, a table for two" },
  { id: "dinner", emoji: "🍽️", title: "Dinner Date", text: "good food, better company" },
  { id: "cafe", emoji: "☕", title: "Cafe Date", text: "warm cups, slower hours" },
  { id: "road", emoji: "🚗", title: "Road Trip", text: "windows down, playlist up" },
  { id: "movie", emoji: "🎬", title: "Movie Night", text: "one ticket, two hearts" }
];

const timeSlots = [
  { id: "1100", label: "11:00 AM", note: "late morning" },
  { id: "1300", label: "1:00 PM", note: "afternoon" },
  { id: "1600", label: "4:00 PM", note: "golden hour" },
  { id: "1800", label: "6:00 PM", note: "early evening" },
  { id: "1930", label: "7:30 PM", note: "prime time" },
  { id: "2100", label: "9:00 PM", note: "night out" },
  { id: "2230", label: "10:30 PM", note: "late night" },
  { id: "surprise", label: "Surprise me", note: "you pick the hour" }
];

const state = { place: null, venue: null, date: null, time: null, when: null };
const API_BASE = (() => {
  if (window.API_BASE) return window.API_BASE;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return "";
  // Live API (Vercel) — same origin after deploy; GitHub Pages uses this fallback
  if (host.includes("github.io")) return "https://i-am-sorry-nuha.vercel.app";
  return "";
})();

function buildDateOptions() {
  const days = [];
  const now = new Date();
  for (let i = 0; i < 10; i += 1) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(now.getDate() + i);
    const label = i === 0
      ? "Today"
      : i === 1
        ? "Tomorrow"
        : d.toLocaleDateString("en-US", { weekday: "short" });
    const note = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const value = d.toISOString().slice(0, 10);
    const full = d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric"
    });
    days.push({ id: value, label, note, full, value });
  }
  return days;
}

const dateOptions = buildDateOptions();

async function saveResponse(payload) {
  try {
    await fetch(`${API_BASE}/api/responses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  } catch (err) {
    console.warn("Could not save response", err);
  }
}

function showScene(name) {
  document.querySelectorAll(".scene").forEach((scene) => {
    scene.classList.toggle("is-active", scene.dataset.scene === name);
  });
}

function renderCards(rootId, items, onPick) {
  const root = document.getElementById(rootId);
  root.innerHTML = items.map((item) => `
    <button class="card" type="button" data-id="${item.id}">
      <span class="emoji">${item.emoji}</span>
      <h3>${item.title}</h3>
      <p>${item.text}</p>
    </button>
  `).join("");

  root.querySelectorAll(".card").forEach((card) => {
    card.addEventListener("click", () => {
      const item = items.find((entry) => entry.id === card.dataset.id);
      burst(card);
      onPick(item);
    });
  });
}

function burst(el) {
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const marks = ["♥", "✧", "❀", "♡"];
  for (let i = 0; i < 10; i += 1) {
    const node = document.createElement("span");
    node.className = "burst";
    node.textContent = marks[i % marks.length];
    const angle = (Math.PI * 2 * i) / 10;
    const dist = 70 + Math.random() * 50;
    node.style.left = `${cx}px`;
    node.style.top = `${cy}px`;
    node.style.setProperty("--x", `${Math.cos(angle) * dist}px`);
    node.style.setProperty("--y", `${Math.sin(angle) * dist - 20}px`);
    node.style.color = i % 2 ? "#e8b4b8" : "#d4b483";
    document.body.appendChild(node);
    setTimeout(() => node.remove(), 1100);
  }
}

const noBtn = document.getElementById("no-btn");
const yesBtn = document.getElementById("yes-btn");

function fleeNo() {
  const pad = 24;
  const maxX = window.innerWidth - noBtn.offsetWidth - pad;
  const maxY = window.innerHeight - noBtn.offsetHeight - pad;
  const yesRect = yesBtn.getBoundingClientRect();
  let x;
  let y;
  let tries = 0;
  do {
    x = pad + Math.random() * Math.max(40, maxX - pad);
    y = pad + Math.random() * Math.max(40, maxY - pad);
    tries += 1;
  } while (
    tries < 12 &&
    Math.hypot(x - yesRect.left, y - yesRect.top) < 160
  );
  noBtn.style.position = "fixed";
  noBtn.style.left = `${x}px`;
  noBtn.style.top = `${y}px`;
}

const panda = document.getElementById("panda");
let pandaX = window.innerWidth / 2;
let pandaY = window.innerHeight / 2;
let targetX = pandaX;
let targetY = pandaY;

function followPanda() {
  pandaX += (targetX - pandaX) * 0.28;
  pandaY += (targetY - pandaY) * 0.28;
  panda.style.transform = `translate(${pandaX - 18}px, ${pandaY - 10}px)`;
  requestAnimationFrame(followPanda);
}

followPanda();

window.addEventListener("mousemove", (event) => {
  targetX = event.clientX;
  targetY = event.clientY;
  if (!document.querySelector('[data-scene="ask"]').classList.contains("is-active")) return;
  const rect = noBtn.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dist = Math.hypot(event.clientX - cx, event.clientY - cy);
  if (dist < 120) fleeNo();
});

noBtn.addEventListener("pointerdown", (event) => {
  event.preventDefault();
  event.stopPropagation();
  fleeNo();
});

noBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
});

window.addEventListener("mousedown", () => {
  panda.classList.add("is-click");
});

window.addEventListener("mouseup", () => {
  panda.classList.remove("is-click");
});

yesBtn.addEventListener("click", () => {
  burst(yesBtn);
  saveResponse({ step: "yes", saidYes: true });
  setTimeout(() => showScene("location"), 280);
});

const scheduleBtn = document.getElementById("schedule-btn");
const scheduleSub = document.getElementById("schedule-sub");

function updateScheduleReady() {
  const ready = Boolean(state.date && state.time);
  scheduleBtn.disabled = !ready;
  scheduleBtn.classList.toggle("is-ready", ready);
}

function renderChips(rootId, items, onSelect) {
  const root = document.getElementById(rootId);
  root.innerHTML = items.map((item) => `
    <button class="chip" type="button" data-id="${item.id}">
      <strong>${item.label}</strong>
      <span>${item.note}</span>
    </button>
  `).join("");

  root.querySelectorAll(".chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      root.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-selected"));
      chip.classList.add("is-selected");
      const item = items.find((entry) => entry.id === chip.dataset.id);
      burst(chip);
      onSelect(item);
      updateScheduleReady();
    });
  });
}

renderChips("date-options", dateOptions, (item) => {
  state.date = item;
});

renderChips("time-options", timeSlots, (item) => {
  state.time = item;
});

// Every date type goes straight to date + time
renderCards("locations", locations, (item) => {
  state.place = item.title;
  state.venue = item.title;
  state.date = null;
  state.time = null;
  state.when = null;
  document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("is-selected"));
  updateScheduleReady();
  scheduleSub.textContent = `For your ${item.title} — choose the day and the hour.`;
  saveResponse({ step: "date-type", saidYes: true, place: state.place });
  setTimeout(() => showScene("when"), 220);
});

scheduleBtn.addEventListener("click", () => {
  if (!state.date || !state.time) return;
  state.when = `${state.date.full} · ${state.time.label}`;
  document.getElementById("out-place").textContent = state.place;
  document.getElementById("out-date").textContent = state.date.full;
  document.getElementById("out-time").textContent = state.time.label;
  burst(scheduleBtn);
  saveResponse({
    step: "plan",
    saidYes: true,
    place: state.place,
    venue: state.place,
    date: state.date.full,
    time: state.time.label,
    when: state.when
  });
  setTimeout(() => showScene("letter"), 240);
});

document.getElementById("replay").addEventListener("click", () => {
  state.place = state.venue = state.date = state.time = state.when = null;
  document.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("is-selected"));
  scheduleSub.textContent = "For every kind of date — choose the day and the hour.";
  updateScheduleReady();
  noBtn.style.position = "absolute";
  noBtn.style.left = "calc(50% + 96px)";
  noBtn.style.top = "0";
  showScene("ask");
});

const canvas = document.getElementById("petals");
const ctx = canvas.getContext("2d");
let petals = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function makePetal() {
  return {
    x: Math.random() * canvas.width,
    y: -20 - Math.random() * canvas.height,
    r: 4 + Math.random() * 7,
    s: 0.4 + Math.random() * 0.9,
    a: Math.random() * Math.PI * 2,
    w: 0.01 + Math.random() * 0.02,
    hue: Math.random() > 0.7 ? "gold" : "rose"
  };
}

function drawPetal(p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.a);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(p.r, -p.r, p.r * 1.4, p.r * 0.2, 0, p.r * 1.6);
  ctx.bezierCurveTo(-p.r * 1.4, p.r * 0.2, -p.r, -p.r, 0, 0);
  ctx.fillStyle = p.hue === "gold"
    ? "rgba(212, 180, 131, 0.28)"
    : "rgba(232, 180, 184, 0.32)";
  ctx.fill();
  ctx.restore();
}

function tick() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach((p) => {
    p.y += p.s;
    p.x += Math.sin(p.a) * 0.45;
    p.a += p.w;
    if (p.y > canvas.height + 30) {
      p.y = -20;
      p.x = Math.random() * canvas.width;
    }
    drawPetal(p);
  });
  requestAnimationFrame(tick);
}

resize();
petals = Array.from({ length: 48 }, makePetal);
window.addEventListener("resize", resize);
tick();
