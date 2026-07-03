// One-off: convert public/work and public/studio images to capped-width WebP.
import sharp from "sharp";
import { readdir, unlink } from "node:fs/promises";
import path from "node:path";

const dirs = ["public/work", "public/studio"];
const MAX_W = 1600;

for (const dir of dirs) {
  for (const file of await readdir(dir)) {
    if (!/\.(png|jpe?g)$/i.test(file)) continue;
    const src = path.join(dir, file);
    const out = src.replace(/\.(png|jpe?g)$/i, ".webp");
    await sharp(src)
      .rotate()
      .resize({ width: MAX_W, withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(out);
    await unlink(src);
    console.log(`${file} -> ${path.basename(out)}`);
  }
}
