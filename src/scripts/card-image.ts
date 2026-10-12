const width = 1011;
const height = 638;

function wrap(ctx: CanvasRenderingContext2D, text: string, max: number) {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > max) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, 3);
}

function paint(ctx: CanvasRenderingContext2D) {
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, "#4d5d82");
  gradient.addColorStop(0.46, "#2a3650");
  gradient.addColorStop(1, "#182236");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  const glow = ctx.createRadialGradient(width, 0, 40, width, 0, width * 0.75);
  glow.addColorStop(0, "rgba(255,255,255,0.18)");
  glow.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);
}

export function cardFileName(name: string) {
  const clean = name.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/[^\w]+/g, "-").replace(/^-|-$/g, "");
  return clean || "blue-card";
}

export function cardFront(name: string, code: string) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  paint(ctx);
  ctx.fillStyle = "#f3f1ec";
  ctx.beginPath();
  ctx.roundRect(56, 52, 168, 58, 6);
  ctx.fill();
  ctx.fillStyle = "#2a3650";
  ctx.font = "600 28px Familjen Grotesk, sans-serif";
  ctx.fillText("Nordisk", 78, 90);

  ctx.fillStyle = "#f6f3ee";
  ctx.font = "600 54px Familjen Grotesk, sans-serif";
  const lines = wrap(ctx, name, width - 160);
  let y = 300;
  for (const line of lines) {
    ctx.fillText(line, 56, y);
    y += 62;
  }
  ctx.font = "600 22px Familjen Grotesk, sans-serif";
  ctx.fillStyle = "rgba(246,243,238,0.78)";
  ctx.fillText("BLUE CARD", 56, y + 8);
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(56, 548);
  ctx.lineTo(width - 170, 548);
  ctx.stroke();
  ctx.fillStyle = "#f6f3ee";
  ctx.font = "600 28px Familjen Grotesk, sans-serif";
  ctx.fillText(code, 56, 598);
  ctx.beginPath();
  ctx.arc(width - 92, 586, 32, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "600 20px Familjen Grotesk, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("NG", width - 92, 594);
  ctx.textAlign = "left";
  return canvas;
}

export function cardBack() {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  paint(ctx);
  ctx.strokeStyle = "rgba(255,255,255,0.16)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(width - 40, height + 20, 180, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#f6f3ee";
  ctx.font = "600 72px Familjen Grotesk, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("Blue Card", width / 2, height / 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  return canvas;
}

function save(canvas: HTMLCanvasElement, name: string) {
  const link = document.createElement("a");
  link.href = canvas.toDataURL("image/png");
  link.download = name;
  link.click();
}

async function ready() {
  await document.fonts.load("600 54px Familjen Grotesk");
}

export async function downloadCardFront(name: string, code: string) {
  await ready();
  save(cardFront(name, code), `${cardFileName(name)}.png`);
}

export async function downloadCardPair(name: string, code: string) {
  await ready();
  const base = cardFileName(name);
  const face = cardFront(name, code);
  const rear = cardBack();
  save(face, `${base}-fata.png`);
  window.setTimeout(() => save(rear, `${base}-spate.png`), 400);
}
