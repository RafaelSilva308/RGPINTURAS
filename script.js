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
  ["Branco", "#f2efe8"],
  ["Branco Neve", "#fcfcfa"],
  ["Branco Gelo", "#e2ecf0"],
  ["Palha", "#e3d3a1"],
  ["Areia", "#d6bf9a"],
  ["Rondon", "#b8693f"],
  ["Verde Primavera", "#8dbb6e"],
  ["Cimento queimado", "radial-gradient(circle at 20% 30%,rgba(255,255,255,.14),transparent 40%),radial-gradient(circle at 70% 70%,rgba(0,0,0,.12),transparent 45%),linear-gradient(135deg,#9a9b98,#83868a)"],
  ["Marmorato", "linear-gradient(115deg,#f1ebe1 0 22%,#d9cebf 32%,#f6f1e8 42%,#c9bcaa 56%,#efe8dc 70%,#d3c7b6 86%,#f1ebe1)"],
  ["Pedras naturais", "radial-gradient(circle at 18% 28%,#b9aa94 0 9%,transparent 10%),radial-gradient(circle at 52% 20%,#8f8271 0 8%,transparent 9%),radial-gradient(circle at 80% 38%,#c9bda9 0 10%,transparent 11%),radial-gradient(circle at 30% 72%,#a39580 0 11%,transparent 12%),radial-gradient(circle at 68% 78%,#7f735f 0 9%,transparent 10%),#cfc4b0", "64px 64px"],
  ["Tempestade", "#a8878a"],
  ["Cipó da Amazônia", "#8b8a4a"],
];
const wall = document.getElementById("wall");
const nameEl = document.getElementById("colorName");
const box = document.getElementById("swatches");

function setColor(i) {
  const [name, hex, size] = colors[i];
  document.documentElement.style.setProperty("--wall", hex);
  document.documentElement.style.setProperty("--wall-size", size || "auto");
  nameEl.textContent = name;
  box.querySelectorAll(".swatch").forEach((b, j) => b.setAttribute("aria-pressed", j === i));
}
colors.forEach(([name, hex, size], i) => {
  const b = document.createElement("button");
  b.className = "swatch";
  b.type = "button";
  b.innerHTML = `<i style="background:${hex};background-size:${size ? "32px 32px" : "auto"}"></i>${name}`;
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
// Versões do "depois": com mais de uma, aparecem botões para alternar
const afters = [
  ["Branco Neve", "assets/depois-branco-neve.webp"],
];
const aftersBox = document.getElementById("afters");
const afterImg = document.getElementById("afterImg");
if (afters.length > 1) {
  aftersBox.hidden = false;
  afters.forEach(([label, src], i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.setAttribute("aria-pressed", i === 0);
    b.addEventListener("click", () => {
      afterImg.src = src;
      aftersBox.querySelectorAll("button").forEach((x, k) => x.setAttribute("aria-pressed", k === i));
    });
    aftersBox.appendChild(b);
  });
}
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

// Cartão de visita: vira ao clicar/teclar e inclina com o mouse
const bcard = document.getElementById("bcard");
const flip = () => {
  const on = bcard.classList.toggle("flipped");
  bcard.setAttribute("aria-pressed", on);
};
bcard.addEventListener("click", flip);
bcard.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flip(); }
});
if (matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
  bcard.addEventListener("mousemove", (e) => {
    const r = bcard.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    bcard.style.transform = `rotateX(${(-y * 8).toFixed(1)}deg) rotateY(${(x * 8).toFixed(1)}deg)`;
  });
  bcard.addEventListener("mouseleave", () => { bcard.style.transform = ""; });
}

// Salvar contato (vCard gerado no navegador)
document.getElementById("saveContact").addEventListener("click", () => {
  const vcf = ["BEGIN:VCARD", "VERSION:3.0", "FN:RG Pinturas", "ORG:RG Pinturas",
    "TITLE:Pintura residencial, comercial e predial", "TEL;TYPE=CELL,VOICE:+5561993879406",
    "NOTE:Atendemos Brasília-DF e entorno. Orçamento sem compromisso.", "END:VCARD"].join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([vcf], { type: "text/vcard" }));
  a.download = "RG-Pinturas.vcf";
  a.click();
  URL.revokeObjectURL(a.href);
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

// Menu mobile
const nav = document.querySelector(".nav");
const menuBtn = document.getElementById("menu");
menuBtn.addEventListener("click", () => {
  const open = nav.classList.toggle("open");
  menuBtn.setAttribute("aria-expanded", open);
  menuBtn.textContent = open ? "✕" : "☰";
});
nav.querySelectorAll("nav a, .btn").forEach((a) => a.addEventListener("click", () => {
  nav.classList.remove("open");
  menuBtn.setAttribute("aria-expanded", "false");
  menuBtn.textContent = "☰";
}));
