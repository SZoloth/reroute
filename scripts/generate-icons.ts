import { writeFile } from "node:fs/promises";
import { PNG } from "pngjs";

function drawIcon(size: number): PNG {
  const png = new PNG({ width: size, height: size });

  const setPixel = (x: number, y: number, r: number, g: number, b: number, a = 255) => {
    const idx = (size * y + x) * 4;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const t = y / size;
      const r = Math.round(12 + 30 * (1 - t));
      const g = Math.round(10 + 6 * (1 - t));
      const b = Math.round(22 + 25 * (1 - t));
      setPixel(x, y, r, g, b);
    }
  }

  const cx = size / 2;
  const cy = size / 2;
  const radius = size * 0.39;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const d = Math.sqrt(dx * dx + dy * dy);

      if (d <= radius) {
        const t = d / radius;
        const r = Math.round(250 - 45 * t);
        const g = Math.round(78 + 30 * (1 - t));
        const b = Math.round(130 + 70 * (1 - t));
        setPixel(x, y, r, g, b);
      }
    }
  }

  const stroke = Math.max(8, Math.floor(size * 0.08));
  const left = Math.floor(size * 0.34);
  const top = Math.floor(size * 0.28);
  const bottom = Math.floor(size * 0.72);

  for (let y = top; y <= bottom; y++) {
    for (let x = left; x < left + stroke; x++) {
      setPixel(x, y, 255, 255, 255);
    }
  }

  for (let i = 0; i < size * 0.22; i++) {
    const x = left + stroke + i;
    const y = Math.floor(size * 0.5) - i;
    for (let s = 0; s < stroke; s++) {
      if (x + s < size && y + s >= 0) setPixel(x + s, y + s, 255, 255, 255);
    }
  }

  for (let i = 0; i < size * 0.24; i++) {
    const x = left + stroke + i;
    const y = Math.floor(size * 0.5) + i;
    for (let s = 0; s < stroke; s++) {
      if (x + s < size && y - s < size) setPixel(x + s, y - s, 255, 255, 255);
    }
  }

  return png;
}

async function main() {
  const icon512 = drawIcon(512);
  const icon192 = drawIcon(192);

  await writeFile("public/icon-512.png", PNG.sync.write(icon512));
  await writeFile("public/icon-192.png", PNG.sync.write(icon192));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
