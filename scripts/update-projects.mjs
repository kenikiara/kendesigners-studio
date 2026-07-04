import sharp from "sharp";
import { rm } from "node:fs/promises";

// New Good Morning Baby Shop design replaces the old one.
await sharp("C:/ken designers/good morning baby shop.png")
  .resize({ width: 1600, withoutEnlargement: true })
  .webp({ quality: 78 })
  .toFile("public/work/good-morning-babyshop.webp");
console.log("updated good-morning-babyshop.webp");

// Remove now-unused second images (each project keeps one homepage shot).
for (const f of [
  "public/work/good-morning-babyshop-2.webp",
  "public/work/huwii-events-2.webp",
  "public/work/sense-of-adventure-2.webp",
  "public/work/landplan-2.webp",
]) {
  await rm(f, { force: true });
  console.log("removed", f);
}
