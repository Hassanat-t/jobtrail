// Draws the extension icons (terracotta tile with a rising trail of three dots) as PNGs.
// Run with `node scripts/make-icons.mjs`. No image libraries needed.
import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const outDir = path.resolve(import.meta.dirname, "../extension/icons");
const TILE = [194, 65, 12]; // #c2410c
const DOT = [255, 253, 249]; // #fffdf9

// Shapes in a 0..1 square.
const RADIUS = 0.22;
const dots = [
  { x: 0.27, y: 0.72, r: 0.085 },
  { x: 0.5, y: 0.5, r: 0.105 },
  { x: 0.73, y: 0.28, r: 0.13 },
];

function insideTile(x, y) {
  const dx = Math.max(RADIUS - x, 0, x - (1 - RADIUS));
  const dy = Math.max(RADIUS - y, 0, y - (1 - RADIUS));
  return dx * dx + dy * dy <= RADIUS * RADIUS;
}
const insideDot = (x, y) => dots.some((d) => (x - d.x) ** 2 + (y - d.y) ** 2 <= d.r * d.r);

function draw(size) {
  const SS = 4; // supersampling for smooth edges
  const rows = [];
  for (let py = 0; py < size; py++) {
    const row = [0]; // PNG filter byte
    for (let px = 0; px < size; px++) {
      let tile = 0;
      let dot = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const x = (px + (sx + 0.5) / SS) / size;
          const y = (py + (sy + 0.5) / SS) / size;
          if (insideTile(x, y)) {
            tile++;
            if (insideDot(x, y)) dot++;
          }
        }
      }
      const n = SS * SS;
      const mix = tile ? dot / tile : 0;
      const rgb = TILE.map((c, i) => Math.round(c + (DOT[i] - c) * mix));
      row.push(...rgb, Math.round((tile / n) * 255));
    }
    rows.push(Buffer.from(row));
  }
  return png(size, Buffer.concat(rows));
}

function png(size, raw) {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type, data) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const body = Buffer.concat([Buffer.from(type), data]);
    const sum = Buffer.alloc(4);
    sum.writeUInt32BE(crc(body));
    return Buffer.concat([len, body, sum]);
  };
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", zlib.deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

fs.mkdirSync(outDir, { recursive: true });
for (const size of [16, 32, 48, 128]) {
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), draw(size));
}
console.log(`icons written to ${outDir}`);
