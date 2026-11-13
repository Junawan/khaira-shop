const fs = require('node:fs/promises');
const path = require('node:path');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

const sampleProducts = [
  { title: 'Ring Cutter Bulat - Set 10 Pcs', specs: ['Bahan stainless steel, tebal 0.4 mm.', '10 ukuran: diameter 3-12 cm; tinggi 4 cm.', 'Varian: set isi 10 pcs.'] },
  { title: 'Cetakan Bolu Kukus - Set 12 Pcs', specs: ['Bahan aluminium press.', 'Model bolong atau polos; ukuran A-D.', 'Ukuran atas 5.5-7.5 cm; tinggi 2.5-4.5 cm.', 'Varian ukuran pendek/tinggi dan bolong/polos.'] },
  { title: 'Dandang Mie Ayam 6 Lubang', specs: ['Bahan stainless steel.', 'Badan 64 x 40 x 23 cm; wadah lubang 45 x 35 cm.', '6 lubang diameter 13.3 cm.', 'Varian: dandang + 6 saringan atau dandang saja.'] },
  { title: 'Kompor Mawar dengan Rangka', specs: ['Bahan rangka besi tebal.', 'Ukuran rangka 43 x 43 x 73 cm.', 'Paket 1 set lengkap dengan tungku dan kompor mawar.'] },
  { title: 'Loyang Kue Mickey Mouse', specs: ['Bahan aluminium, tebal 0.4 mm.', 'Bentuk Mickey Mouse; ukuran 27 x 21 x 5 cm.', 'Varian: bentuk Mickey.'] },
  { title: 'Loyang Brownies Sekat 26 x 26', specs: ['Bahan loyang aluminium 0.4 mm; sekat 0.6 mm.', 'Ukuran 26 x 26 cm; tinggi 4 cm; 100 kotak.', 'Sekat dapat dilepas.', 'Varian: loyang + sekat atau loyang saja.'] },
  { title: 'Panci Gagang Aluminium 17 cm', specs: ['Bahan aluminium tebal.', 'Diameter atas 17 cm; bawah 13 cm.', 'Tinggi 8.5 cm; panjang gagang 13 cm.'] },
  { title: 'Loyang Pie Oval Bongkar Pasang', specs: ['Bahan aluminium; alas dapat dilepas.', 'Bentuk oval; tinggi 3.5 cm.', 'Pilihan ukuran 16, 18, 20, 22, 24 cm.', 'Varian satuan atau set.'] },
  { title: 'Loyang Brownies Kotak', specs: ['Bentuk persegi; bahan 0.4 mm.', 'Ukuran 20 x 20 x 4 cm atau 22 x 22 x 4 cm.', 'Varian ukuran 20 x 20 atau 22 x 22 cm.'] },
  { title: 'Loyang Brownies Sekat Grade B 20 x 20', specs: ['Ukuran 20 x 20 cm; tinggi 4 cm.', 'Loyang aluminium atau galvalum 0.3 mm; sekat 0.5 mm.', 'Pilihan 16, 20, 25 atau 36 sekat.', 'Varian bahan dan jumlah sekat.'] },
  { title: 'Lampu Pilar Minimalis - Motif Lafadz', specs: ['Bahan besi solid dengan kaca tebal.', 'Tinggi 25 cm; atap lebar 17 cm; badan 12 cm.', 'Termasuk fitting; cat anti karat.', 'Varian motif Allah atau Muhammad.'] },
  { title: 'Loyang Kue Angka', specs: ['Bahan aluminium.', 'Ukuran 20 x 16 x 5 cm.', 'Pilihan bentuk angka 0-9.'] },
  { title: 'Deep Fryer Kotak Stainless', specs: ['Bahan stainless steel.', 'Ukuran keseluruhan 47 x 35 x 32 cm.', 'Wajan 41.5 x 31.5 x 10.5 cm.', 'Varian jaring tinggi 5.5 cm atau 10 cm.'] },
  { title: 'Cetakan Almond Crispy', specs: ['Bahan plastik PFC food grade, tebal 2 mm.', 'Lubang bulat diameter 8 cm.', 'Ukuran isi 6: 30 x 20 cm; isi 9: 30 x 30 cm; isi 12: 40 x 30 cm.', 'Varian 3, 6, 9 atau 12 lubang.'] },
  { title: 'Cetakan Kue Kering Kupu-kupu', specs: ['Bahan stainless steel; tinggi 1.5 cm.', '10 lubang: 19 x 8.5 cm; 20 lubang: 19 x 15 cm.', 'Ukuran per cetakan 3.5 x 3.5 cm.', 'Varian 10 atau 20 lubang.'] },
  { title: 'Loyang Muffin Aluminium', specs: ['Bahan aluminium, tebal 0.5 mm.', 'Pilihan 6, 9, 12 atau 16 lubang.', 'Ukuran loyang 23 x 16 hingga 31 x 31 cm.', 'Varian jumlah lubang dan model polos/bolong.'] },
  { title: 'Loyang Tulban Miring - 12 Pcs', specs: ['Bahan aluminium.', 'Diameter atas 16 cm; bawah 11 cm.', 'Tinggi 5 cm; isi 12 pcs.'] },
  { title: 'Loyang Kue Bola', specs: ['Bahan aluminium tebal.', 'Diameter 8 cm; bentuk setengah bola atau bola utuh.', 'Varian: setengah bola atau full bola.'] },
  { title: 'Klakat Steamer Stainless 30 cm', specs: ['Bahan stainless; bawah 0.4 mm, sisi 0.35 mm.', 'Diameter 30 cm; tinggi badan 17 cm.', 'Tinggi total dengan tutup 28 cm; kukusan 6 cm.', 'Varian satu susun dengan kemasan kayu.'] },
  { title: 'Parutan Serbaguna Stainless', specs: ['Bahan stainless steel.', 'Ukuran 210 x 55 x 3 mm.', 'Dilengkapi gagang berlubang untuk gantungan.'] },
];

const W = 595.28, H = 841.89;
const C = {
  bg: rgb(0.965, 0.957, 0.929), ink: rgb(0.11, 0.16, 0.16),
  muted: rgb(0.38, 0.43, 0.42), accent: rgb(0.75, 0.24, 0.14),
  accentLight: rgb(0.97, 0.91, 0.86), white: rgb(1, 1, 1), line: rgb(0.89, 0.87, 0.82),
};

function wrap(text, font, size, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (font.widthOfTextAtSize(test, size) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

function drawTextBlock(page, text, x, topY, width, font, size, color, lineHeight, maxLines = 6) {
  let y = topY;
  let lines = wrap(text, font, size, width);
  if (lines.length > maxLines) {
    lines = lines.slice(0, maxLines);
    while (lines[maxLines - 1].length > 2 && font.widthOfTextAtSize(lines[maxLines - 1] + '...', size) > width) {
      lines[maxLines - 1] = lines[maxLines - 1].slice(0, -1);
    }
    lines[maxLines - 1] += '...';
  }
  for (const line of lines) {
    page.drawText(line, { x, y: y - size, size, font, color });
    y -= lineHeight;
  }
  return y;
}

async function main() {
  const products = JSON.parse(await fs.readFile('tmp/pdfs/products.json', 'utf8'));
  // Exclude the standalone wooden packing add-on, which has no product specifications.
  const noSpecPacking = products.findIndex((product) => product.title === 'Produk KhairaShop25');
  if (noSpecPacking !== -1) products.splice(noSpecPacking, 1);
  const pdf = await PDFDocument.create();
  const reg = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const logo = await pdf.embedPng(await fs.readFile('public/logo.png'));

  // Cover
  let page = pdf.addPage([W, H]);
  page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.bg });
  page.drawRectangle({ x: 0, y: H - 17, width: W, height: 17, color: C.accent });
  page.drawImage(logo, { x: 193, y: 474, width: 210, height: 210 });
  page.drawText('KHAIRASHOP25', { x: 90, y: 410, width: W - 180, size: 29, font: bold, color: C.ink, characterSpacing: 1.5 });
  page.drawText('Katalog Produk', { x: 160, y: 364, width: W - 320, size: 24, font: bold, color: C.accent });
  page.drawText('Perlengkapan baking dan kebutuhan dapur pilihan', { x: 84, y: 331, width: W - 168, size: 11.5, font: reg, color: C.muted });
  page.drawLine({ start: { x: 105, y: 292 }, end: { x: W - 105, y: 292 }, thickness: 1, color: C.line });
  page.drawText(`${products.length} produk`, { x: 238, y: 263, size: 11, font: bold, color: C.ink });
  page.drawText('Koleksi produk aktif dari katalog ks25.my.id', { x: 130, y: 239, size: 10, font: reg, color: C.muted });
  page.drawText('Tanpa harga | Bahan, ukuran, bentuk dan varian', { x: 127, y: 209, size: 9, font: reg, color: C.muted });
  page.drawText('www.ks25.my.id', { x: 230, y: 45, size: 9, font: bold, color: C.accent });

  const margin = 32, gapX = 12, gapY = 9;
  const cardW = (W - margin * 2 - gapX) / 2;
  const cardH = 111;
  const topStart = H - 72;
  const productsPerPage = 12;
  const pageCount = Math.ceil(products.length / productsPerPage);

  for (let p = 0; p < pageCount; p++) {
    page = pdf.addPage([W, H]);
    page.drawRectangle({ x: 0, y: 0, width: W, height: H, color: C.bg });
    page.drawRectangle({ x: 0, y: H - 10, width: W, height: 10, color: C.accent });
    page.drawText('KHAIRASHOP25', { x: margin, y: H - 41, size: 12, font: bold, color: C.ink, characterSpacing: 0.5 });
    page.drawText('KOLEKSI PRODUK', { x: W - 141, y: H - 40, size: 8, font: bold, color: C.accent, characterSpacing: 1 });
    page.drawLine({ start: { x: margin, y: H - 53 }, end: { x: W - margin, y: H - 53 }, thickness: 0.7, color: C.line });

    for (let k = 0; k < productsPerPage; k++) {
      const i = p * productsPerPage + k;
      if (i >= products.length) break;
      const col = k % 2, row = Math.floor(k / 2);
      const x = margin + col * (cardW + gapX);
      const top = topStart - row * (cardH + gapY);
      const y = top - cardH;
      page.drawRectangle({ x, y, width: cardW, height: cardH, color: C.white, borderColor: C.line, borderWidth: 0.8 });
      page.drawRectangle({ x, y: top - 5, width: 34, height: 5, color: C.accent });

      const asset = products[i].image;
      const imgBytes = await fs.readFile(asset);
      const img = await pdf.embedJpg(imgBytes);
      const ix = x + 10, iy = y + 19, iw = 72, ih = 72;
      page.drawRectangle({ x: ix - 1, y: iy - 1, width: iw + 2, height: ih + 2, color: C.accentLight });
      const scale = Math.min(iw / img.width, ih / img.height);
      const dw = img.width * scale, dh = img.height * scale;
      page.drawImage(img, { x: ix + (iw - dw) / 2, y: iy + (ih - dh) / 2, width: dw, height: dh });

      const tx = x + 91, tw = cardW - 101;
      let ty = drawTextBlock(page, products[i].title, tx, top - 9, tw, bold, 8.4, C.ink, 9.8, 3) - 4;
      for (const spec of products[i].specs.slice(0, 4)) {
        page.drawCircle({ x: tx + 2, y: ty - 3.6, size: 1.3, color: C.accent });
        ty = drawTextBlock(page, spec, tx + 7, ty, tw - 7, reg, 7.0, C.muted, 8.1, 2) - 2;
      }
    }

    page.drawLine({ start: { x: margin, y: 30 }, end: { x: W - margin, y: 30 }, thickness: 0.7, color: C.line });
    page.drawText('Koleksi perlengkapan baking dan dapur', { x: margin, y: 17, size: 7.6, font: reg, color: C.muted });
    page.drawText(`${p + 1} / ${pageCount}`, { x: W - margin - 32, y: 17, size: 7.6, font: bold, color: C.accent });
  }

  const bytes = await pdf.save();
  await fs.writeFile('output/pdf/khairashop25-katalog-produk.pdf', bytes);
  console.log(`Created ${pdf.getPageCount()} pages, ${products.length} products.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
