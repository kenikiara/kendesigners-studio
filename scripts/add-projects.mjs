import sharp from "sharp";

const map = {
  "C:/ken designers/coachruthjackson website.png": "public/work/ruth-jackson.webp",
  "C:/ken designers/sheflavours.png": "public/work/sheflavours.webp",
  "C:/ken designers/stonecrestafrica.png": "public/work/stonecrest.webp",
  "C:/ken designers/bluelilac.png": "public/work/blue-lilac.webp",
  "C:/ken designers/excavator truck master.png": "public/work/excavator-truck-master.webp",
};

for (const [src, out] of Object.entries(map)) {
  await sharp(src)
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 76 })
    .toFile(out);
  console.log(out);
}
