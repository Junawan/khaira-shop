const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const base = process.cwd();
const dl = path.join(process.env.USERPROFILE || 'C:/Users/LENOVO', 'Downloads');
async function main() {
const ids = (await fs.readFile(path.join(base, 'tmp/pdfs/image_ids.txt'), 'utf8')).split(/\r?\n/).filter(Boolean);
const backup = JSON.parse(await fs.readFile(path.join(base, 'backups/product-descriptions-before-seo-2026-10-26.json'), 'utf8'));
if (ids.length !== backup.records.length) throw new Error(`Image/product count mismatch: ${ids.length} vs ${backup.records.length}`);
const assetDir = path.join(base, 'tmp/pdfs/full_assets');
await fs.mkdir(assetDir, { recursive: true });
const files = await fs.readdir(dl);

function cleanLine(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/gi, ' ').replace(/&amp;/gi, '&')
    .replace(/^\s*(?:[-*•#]+\s*)+/, '').replace(/\s+/g, ' ').trim();
}
function short(value, max = 88) {
  if (value.length <= max) return value;
  const cut = value.slice(0, max - 1);
  const space = cut.lastIndexOf(' ');
  return (space > 38 ? cut.slice(0, space) : cut) + '...';
}
function extract(record) {
  const text = String(record.description || '').replace(/\r/g, '');
  const raw = text.split('\n').map(cleanLine).filter(Boolean);
  let title = raw[0] || 'Produk KhairaShop25';
  title = title.replace(/^deskripsi\s+/i, '').replace(/\s*[-|].*$/, '').replace(/\s+/g, ' ').trim();
  if (/^(spesifikasi|deskripsi produk|keunggulan|penggunaan|packing|catatan)/i.test(title)) {
    title = raw[1] || 'Produk KhairaShop25';
  }
  title = title.split(/(?:\.|\||—|–|\bmerupakan\b|\bberkualitas\b|\bterbuat\b|\bdesain menarik\b)/i)[0].trim();
  title = short(title, 55);

  const specs = [];
  const seen = new Set();
  for (const line of raw.slice(1)) {
    if (line.length < 5 || line.length > 420) continue;
    if (/\b(harga|rp\s?\.?\s?\d|idr|packing|pengiriman|catatan penjual|video unboxing|garansi|keunggulan|penggunaan produk|cocok digunakan|hubungi kami|terima kasih|ulasan|seller)\b/i.test(line)) continue;
    if (/^(spesifikasi|deskripsi|detail|kelebihan|manfaat|fungsi|cara penggunaan|fitur utama|packing aman|informasi produk|varian paket|pilihan bentuk|varian sekat)\b/i.test(line)) continue;
    if (/#|(?:ringan, kuat|tahan lama|berkualitas|praktis &|desain menarik|memudahkan|cocok untuk)/i.test(line)) continue;
    if (!/(bahan|material|ukuran|diameter|tinggi|ketebalan|tebal|panjang|lebar|bentuk|varian|pilihan|tersedia|isi\s*\d|lubang|model|angka|warna|kapasitas|\bcm\b|\bmm\b|\bpcs\b|sekat|kotak|set\b)/i.test(line)) continue;
    if (/^\d+[.)]?$/.test(line)) continue;
    let core = line;
    const label = core.match(/^(?:bahan(?:\s*&\s*ukuran)?|material|ukuran|diameter|tinggi|ketebalan|tebal|panjang|lebar|bentuk|varian|pilihan|tersedia|isi|lubang|model|warna|kapasitas)\s*[:\-]\s*/i);
    if (label) core = core.slice(label[0].length);
    core = core.split(/(?:\.\s|;\s|\bserta\b|\byang\s+(?:ringan|kuat|tahan|cocok|membuat)\b)/i)[0].trim();
    const item = short((label ? label[0].replace(/[:\-]\s*$/, '') + ': ' : '') + core, 78);
    const key = item.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    specs.push(item);
    if (specs.length >= 5) break;
  }
  if (!specs.length) {
    const fallback = raw.slice(1).find(line => line.length > 18 && !/rp\s?\d|harga|packing/i.test(line));
    specs.push(short(fallback || 'Detail bahan dan ukuran lihat keterangan produk.', 78));
  }
  return { title, specs };
}

const products = [];
const missing = [];
for (let i = 0; i < ids.length; i++) {
  const id = ids[i];
  const candidates = files.filter(name => name === `${id}.jpg` || name === `${id}.jfif` || name === `${id}.jpeg` || name.startsWith(`${id} (`));
  if (!candidates.length) { missing.push({ i: i + 1, id }); continue; }
  const source = path.join(dl, candidates[0]);
  const out = path.join(assetDir, `p${String(i + 1).padStart(3, '0')}.jpg`);
  await sharp(source).resize(560, 560, { fit: 'inside', withoutEnlargement: true }).jpeg({ quality: 78, mozjpeg: true }).toFile(out);
  products.push({ ...extract(backup.records[i]), image: out });
}
if (missing.length) {
  await fs.writeFile(path.join(base, 'tmp/pdfs/missing_images.json'), JSON.stringify(missing, null, 2));
  throw new Error(`Missing ${missing.length} images: ${JSON.stringify(missing.slice(0, 8))}`);
}
await fs.writeFile(path.join(base, 'tmp/pdfs/products.json'), JSON.stringify(products));
console.log(`Prepared ${products.length} products and photos.`);
}
main().catch((error) => { console.error(error); process.exit(1); });
