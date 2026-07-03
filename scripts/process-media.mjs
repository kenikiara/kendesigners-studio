// One-off: convert generated media to web sizes.
import sharp from "sharp";
import { unlink } from "node:fs/promises";

await sharp("public/media/faq-editorial.png")
  .resize({ width: 900 })
  .webp({ quality: 78 })
  .toFile("public/media/faq-editorial.webp");
await unlink("public/media/faq-editorial.png");

await sharp("public/media/logo-k.png")
  .resize({ width: 512 })
  .webp({ quality: 90 })
  .toFile("public/media/logo-k.webp");

// Favicon-sized PNG kept for app icon
await sharp("public/media/logo-k.png")
  .resize({ width: 64 })
  .png()
  .toFile("src/app/icon.png");
await unlink("public/media/logo-k.png");

console.log("done");
