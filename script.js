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
// Texturas procedurais (SVG com ruído) para os acabamentos; aplicadas com multiply sobre a foto
const tex = (inner) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="520" height="520"><filter id="f" x="0" y="0" width="100%" height="100%">${inner}</filter><rect width="520" height="520" filter="url(#f)"/></svg>`
  )}")`;
const toGray = '<feColorMatrix type="matrix" values="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 0 0 0 0 1"/>';
const TEX = "520px 520px";
const cimento = tex(`<feTurbulence type="fractalNoise" baseFrequency=".009 .014" numOctaves="5" seed="7" stitchTiles="stitch"/>${toGray}<feComponentTransfer><feFuncR type="linear" slope="1.5" intercept="-.12"/><feFuncG type="linear" slope="1.5" intercept="-.12"/><feFuncB type="linear" slope="1.5" intercept="-.1"/></feComponentTransfer>`);
const veio = "0.97 0.97 0.97 0.97 0.95 0.82 0.6 0.82 0.95 0.97 0.97 0.97 0.97";
const marmorato = tex(`<feTurbulence type="fractalNoise" baseFrequency=".006 .02" numOctaves="5" seed="11" stitchTiles="stitch"/>${toGray}<feComponentTransfer><feFuncR type="table" tableValues="${veio}"/><feFuncG type="table" tableValues="${veio}"/><feFuncB type="table" tableValues="${veio}"/></feComponentTransfer><feColorMatrix type="matrix" values=".99 0 0 0 0 0 .96 0 0 0 0 0 .9 0 0 0 0 0 0 1"/>`);
const pedras = tex(`<feTurbulence type="fractalNoise" baseFrequency=".055 .07" numOctaves="2" seed="4" stitchTiles="stitch"/>${toGray}<feComponentTransfer><feFuncR type="discrete" tableValues=".84 .70 .77 .64 .74 .82"/><feFuncG type="discrete" tableValues=".78 .64 .71 .58 .68 .76"/><feFuncB type="discrete" tableValues=".67 .53 .60 .47 .57 .65"/></feComponentTransfer>`);

const colors = [
  ["Branco", "#f2efe8", "branco"],
  ["Branco Neve", "#fcfcfa", "branco-neve"],
  ["Branco Gelo", "#e2ecf0", "branco-gelo"],
  ["Palha", "#e3d3a1", "palha"],
  ["Areia", "#d6bf9a", "areia"],
  ["Rondon", "#b8693f", "rondon"],
  ["Verde Primavera", "#8dbb6e", "verde-primavera"],
  ["Cimento queimado", cimento, "cimento-queimado", TEX],
  ["Marmorato", marmorato, "marmorato", TEX],
  ["Pedras naturais", pedras, "pedras-naturais", TEX],
  ["Tempestade", "#a8878a", "tempestade"],
  ["Cipó da Amazônia", "#8b8a4a", "cipo-da-amazonia"],
];
const nameEl = document.getElementById("colorName");
const box = document.getElementById("swatches");
const imgs = [document.getElementById("roomA"), document.getElementById("roomB")];
const reduceMotion = matchMedia("(prefers-reduced-motion:reduce)").matches;
const roomSrc = (i) => `assets/sala/${colors[i][2]}.webp`;
const available = new Set();
const swatchEls = [];
let current = 1; // Branco Neve é a sala base já exibida
let front = 0;

// Cada cor é uma foto da mesma sala; a troca é um desvanecer entre duas imagens
function setColor(i) {
  if (i === current || !available.has(i)) return;
  const next = imgs[front ^ 1];
  next.src = roomSrc(i);
  next.classList.add("on");
  imgs[front].classList.remove("on");
  front ^= 1;
  current = i;
  nameEl.textContent = colors[i][0];
  swatchEls.forEach((b, j) => b.setAttribute("aria-pressed", j === i));
}

// Alterna sozinho entre as cores disponíveis; ao escolher uma, dá uma pausa para ela ser vista
let timer = null;
let visible = true;
function nextAvailable() {
  for (let k = 1; k <= colors.length; k++) {
    const i = (current + k) % colors.length;
    if (available.has(i)) return i;
  }
  return current;
}
function play(delay = 3500) {
  clearTimeout(timer);
  if (reduceMotion) return;
  timer = setTimeout(() => {
    if (visible && !document.hidden && available.size > 1) setColor(nextAvailable());
    play();
  }, delay);
}

colors.forEach(([name, bg, , size], i) => {
  const b = document.createElement("button");
  b.className = "swatch";
  b.type = "button";
  b.hidden = true; // aparece quando a foto da cor existir
  const chip = document.createElement("i");
  chip.style.background = bg;
  chip.style.backgroundSize = size ? "cover" : "auto";
  b.append(chip, name);
  b.addEventListener("click", () => {
    setColor(i);
    play(9000);
    document.getElementById("room").scrollIntoView({ behavior: "smooth", block: "center" });
  });
  box.appendChild(b);
  swatchEls.push(b);
});

// Pré-carrega as fotos; só as que existem entram na paleta e na troca automática
// (depois do carregamento da página, para não competir com a imagem do topo)
const preload = () => colors.forEach((_, i) => {
  const im = new Image();
  im.onload = () => {
    available.add(i);
    swatchEls[i].hidden = false;
    swatchEls[i].setAttribute("aria-pressed", i === current);
  };
  im.src = roomSrc(i);
});
if (document.readyState === "complete") preload();
else addEventListener("load", preload);
play();
new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(document.getElementById("room"));

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
