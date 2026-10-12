// Recolors the atlas tiles into the dark theme. Usage: node recolor-dark-tiles.cjs <inputDir> <outputDir>  (or a single .png for a preview)
const sharp = require("sharp"); const fs = require("fs"); const path = require("path");

function rgb2hsl(r, g, b) {
  r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); const l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l]; const d = mx - mn; const s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return [h * 60, s, l];
}
function hsl2rgb(h, s, l) {
  const f = (n) => { const k = (n + h / 30) % 12; const a = s * Math.min(l, 1 - l); return Math.round(255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)))); };
  return [f(0), f(8), f(4)];
}
function mapPixel(r, g, b) {
  const [h, s, l] = rgb2hsl(r, g, b);
  // Labels: dark, low-saturation pixels -> light gray (readable on a dark background)
  if (l < 0.5 && s < 0.18) return hsl2rgb(222, 0.08, 0.86 - l * 0.6);
  const base = 0.055 + 0.27 * Math.pow(l, 2.6);
  if (s > 0.25 && h >= 185 && h <= 235) return hsl2rgb(214, 0.42, 0.045 + 0.06 * l);          // water
  if (s >= 0.8 && h >= 38 && h <= 62 && l > 0.8 && l < 0.97) return hsl2rgb(38, 0.58, 0.24); // main roads -> amber
  if (s > 0.2 && h >= 70 && h <= 150) return hsl2rgb(150, 0.10, base * 0.85);                     // green areas
  if (s > 0.2 && h >= 20 && h < 70) return hsl2rgb(40, 0.08, base * 0.95);                       // sand/desert/dirt roads
  return hsl2rgb(225, 0.07, base);                                                                // city, buildings, white roads
}
async function recolor(inFile, outFile, asPng) {
  const { data, info } = await sharp(inFile).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) { const [r, g, b] = mapPixel(data[i], data[i + 1], data[i + 2]); data[i] = r; data[i + 1] = g; data[i + 2] = b; }
  const img = sharp(data, { raw: { width: info.width, height: info.height, channels: 3 } });
  await (asPng ? img.png() : img.webp({ quality: 90, effort: 6 })).toFile(outFile);
}
module.exports = { recolor };
if (require.main === module) {
  const [, , a, b] = process.argv;
  if (fs.statSync(a).isFile()) recolor(a, b, true).then(() => console.log("preview:", b));
  else (async () => {
    let n = 0;
    for (const z of fs.readdirSync(a)) {
      fs.mkdirSync(path.join(b, z), { recursive: true });
      for (const f of fs.readdirSync(path.join(a, z))) { await recolor(path.join(a, z, f), path.join(b, z, f), false); n++; }
    }
    console.log("recolored:", n, "tiles");
  })();
}
