const PHONE = "5561993879406";
const waUrl = (text) => `https://wa.me/${PHONE}${text ? "?text=" + encodeURIComponent(text) : ""}`;

// Links gerais do WhatsApp (os que apontam para #orcamento continuam internos)
document.querySelectorAll(".wa-link").forEach((a) => {
  if (a.getAttribute("href") === "#") {
    a.href = waUrl("Olá! Vim pelo site da RG Pinturas e gostaria de um orçamento.");
    a.target = "_blank";
    a.rel = "noopener";
  }
});

// Simulador de cores
const colors = [
  ["Terracota", "#c8684a"], ["Verde sálvia", "#8fa68a"], ["Azul petróleo", "#2f5d6b"],
  ["Areia", "#d9c3a0"], ["Cinza grafite", "#4a4f5a"], ["Rosé", "#e0aaa0"],
  ["Mostarda", "#d9a22e"], ["Off-white", "#efe9dd"], ["Azul céu", "#8fb8d6"], ["Oliva", "#6f7545"],
];
const wall = document.getElementById("wall");
const nameEl = document.getElementById("colorName");
const box = document.getElementById("swatches");

function setColor(i) {
  const [name, hex] = colors[i];
  document.documentElement.style.setProperty("--wall", hex);
  nameEl.textContent = name;
  box.querySelectorAll(".swatch").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
}
colors.forEach(([name, hex], i) => {
  const b = document.createElement("button");
  b.className = "swatch";
  b.type = "button";
  b.innerHTML = `<i style="background:${hex}"></i>${name}`;
  b.addEventListener("click", () => {
    setColor(i);
    document.getElementById("room").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  box.appendChild(b);
});
setColor(0);

// Antes e depois
const range = document.getElementById("range");
const before = document.getElementById("before");
const handle = document.getElementById("handle");
range.addEventListener("input", () => {
  const v = range.value;
  before.style.clipPath = `inset(0 ${100 - v}% 0 0)`;
  handle.style.left = v + "%";
});

// Formulário -> WhatsApp
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  const f = e.target;
  const nome = f.nome.value.trim();
  f.nome.classList.toggle("err", !nome);
  if (!nome) return f.nome.focus();
  const msg = [
    `Olá! Meu nome é ${nome}.`,
    `Serviço: ${f.servico.value}.`,
    f.local.value.trim() && `Local: ${f.local.value.trim()}.`,
    f.obs.value.trim() && `Detalhes: ${f.obs.value.trim()}`,
    "Gostaria de um orçamento.",
  ].filter(Boolean).join("\n");
  window.open(waUrl(msg), "_blank", "noopener");
});

// Animação de entrada
const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
}, { threshold: 0.12 });
document.querySelectorAll(".card,.steps li,.section-head,details,.swatch").forEach((el) => {
  el.classList.add("reveal");
  io.observe(el);
});

document.getElementById("year").textContent = new Date().getFullYear();
