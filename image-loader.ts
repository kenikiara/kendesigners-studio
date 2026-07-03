// Static export: serve images as-is, but prepend basePath because
// next/image does not apply basePath to src in Next 16.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

export default function imageLoader({ src }: { src: string }) {
  if (src.startsWith("http")) return src;
  return `${basePath}${src}`;
}
