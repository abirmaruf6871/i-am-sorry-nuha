const locations = [
  { id: "rooftop", emoji: "🌃", title: "Restaurant Rooftop", text: "stars, skyline, a table for two" },
  { id: "dinner", emoji: "🍽️", title: "Dinner Date", text: "good food, better company" },
  { id: "cafe", emoji: "☕", title: "Cafe Date", text: "warm cups, slower hours" },
  { id: "road", emoji: "🚗", title: "Road Trip", text: "windows down, playlist up" },
  { id: "movie", emoji: "🎬", title: "Movie Night", text: "one ticket, two hearts" }
];

const venues = [
  { id: "restaurant", emoji: "🕯️", title: "Restaurant", text: "slow courses, shared dessert, your favorite wine" },
  { id: "hotel", emoji: "🏨", title: "Hotel evening", text: "soft lights, late check-in, nowhere to rush" },
  { id: "city", emoji: "✨", title: "City lights", text: "glass, gold hour, and a table for two" },
  { id: "garden", emoji: "🌸", title: "Hidden garden", text: "jasmine, candle smoke, nowhere else to be" },
  { id: "home", emoji: "🏡", title: "Stay in together", text: "blankets, a movie, and just us" },
  { id: "surprise", emoji: "💌", title: "Surprise me", text: "you choose the map. I will follow." }
];

const times = [
  { id: "golden", emoji: "🌅", title: "Golden hour", text: "when the sky blushes first" },
  { id: "dinner", emoji: "🍷", title: "Dinner", text: "the classic, unhurried kind" },
  { id: "midnight", emoji: "🌌", title: "After midnight", text: "quiet streets, louder hearts" },
  { id: "rain", emoji: "🌧️", title: "Rainy afternoon", text: "if the sky cries, we stay closer" }
];

const state = { place: null, venue: null, when: null };

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
  setTimeout(() => showScene("location"), 280);
});

renderCards("locations", locations, (item) => {
  state.place = item.title;
  setTimeout(() => showScene("venue"), 220);
});

renderCards("venues", venues, (item) => {
  state.venue = item.title;
  setTimeout(() => showScene("when"), 220);
});

renderCards("times", times, (item) => {
  state.when = item.title;
  document.getElementById("out-place").textContent = state.place;
  document.getElementById("out-venue").textContent = state.venue;
  document.getElementById("out-when").textContent = state.when;
  setTimeout(() => showScene("letter"), 240);
});

document.getElementById("replay").addEventListener("click", () => {
  state.place = state.venue = state.when = null;
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
