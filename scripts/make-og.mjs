// Generate the Open Graph / social preview image (1200x630).
//
//   node scripts/make-og.mjs                     -> paper poster, no photograph
//   node scripts/make-og.mjs img/chevelle.jpg    -> full-bleed car photo + burgundy band
//
// Usage: node scripts/make-og.mjs [source-photo] [output]
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const SRC = process.argv[2];
const OUT = process.argv[3] || 'public/og.jpg';
const W = 1200;
const H = 630;

/** stock line is derived from the inventory so the card never goes stale */
function stockLine() {
  try {
    const src = readFileSync('src/data/cars.ts', 'utf8');
    const count = (src.match(/^\s{4}slug: '/gm) ?? []).length;
    return count > 0 ? `${count} cars in stock` : '';
  } catch {
    return '';
  }
}

const defs = `
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f9f3e7"/>
      <stop offset="1" stop-color="#efe3cf"/>
    </linearGradient>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#231a14" stroke-opacity="0.05" stroke-width="1"/>
    </pattern>
    <linearGradient id="scrim" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0.45" stop-color="#231a14" stop-opacity="0"/>
      <stop offset="1" stop-color="#231a14" stop-opacity="0.5"/>
    </linearGradient>
  </defs>`;

/** Poster with no photograph: wordmark plus an ornament. */
const posterSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <rect x="14" y="0" width="${W - 14}" height="${H}" fill="url(#hatch)"/>
  <rect x="0" y="0" width="14" height="${H}" fill="#7a2b2b"/>
  <rect x="58" y="58" width="${W - 116}" height="${H - 116}" fill="none" stroke="#231a14" stroke-opacity="0.3" stroke-width="2"/>
  <text x="92" y="146" font-family="Georgia, 'Times New Roman', serif" font-size="19" letter-spacing="7" fill="#7a2b2b">EST. 1978 · BROOKSVILLE, FLORIDA</text>
  <text x="92" y="252" font-family="Georgia, 'Times New Roman', serif" font-size="72" letter-spacing="2" fill="#231a14">AUTO ADVISORS</text>
  <text x="92" y="326" font-family="Georgia, 'Times New Roman', serif" font-size="72" letter-spacing="2" fill="#231a14">OF AMERICA, LLC</text>
  <rect x="92" y="362" width="104" height="4" fill="#7a2b2b"/>
  <text x="92" y="420" font-family="Georgia, 'Times New Roman', serif" font-size="23" fill="#6b5b4b">American classics — sales, restoration</text>
  <text x="92" y="454" font-family="Georgia, 'Times New Roman', serif" font-size="23" fill="#6b5b4b">&amp; service</text>
  <text x="92" y="${H - 78}" font-family="Georgia, 'Times New Roman', serif" font-size="19" letter-spacing="3" fill="#6b5b4b">goldeneramotors.site</text>
  <g transform="translate(830 200)">
    <rect x="-40" y="-6" width="290" height="1.5" fill="#231a14" fill-opacity="0.35"/>
    <text x="96" y="62" font-family="Georgia, 'Times New Roman', serif" font-size="86" letter-spacing="6" fill="#231a14" fill-opacity="0.55" text-anchor="middle">1978</text>
    <rect x="-40" y="92" width="290" height="1.5" fill="#231a14" fill-opacity="0.35"/>
    <g fill="#7a2b2b" fill-opacity="0.7">
      <rect x="90" y="112" width="10" height="10" transform="rotate(45 95 117)"/>
      <rect x="66" y="112" width="10" height="10" transform="rotate(45 71 117)"/>
      <rect x="114" y="112" width="10" height="10" transform="rotate(45 119 117)"/>
    </g>
  </g>
</svg>`;

/** Photograph layout: the car fills the card, a burgundy band carries the wordmark. */
const BAND = 124;
const stock = stockLine();
const photoSvg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="${W}" height="${H}" fill="url(#scrim)"/>
  <rect x="30" y="30" width="${W - 60}" height="${H - BAND - 60}" fill="none" stroke="#faf5ec" stroke-opacity="0.45" stroke-width="2"/>

  <rect x="46" y="46" width="516" height="46" fill="#faf5ec" fill-opacity="0.95"/>
  <text x="64" y="76" font-family="Georgia, 'Times New Roman', serif" font-size="17" letter-spacing="4.6" fill="#7a2b2b">EST. 1978 · BROOKSVILLE, FLORIDA</text>

  <rect x="0" y="${H - BAND}" width="${W}" height="${BAND}" fill="#7a2b2b" fill-opacity="0.96"/>
  <rect x="0" y="${H - BAND}" width="${W}" height="3" fill="#faf5ec" fill-opacity="0.5"/>
  <text x="72" y="${H - BAND + 54}" font-family="Georgia, 'Times New Roman', serif" font-size="38" letter-spacing="5" fill="#faf5ec">AUTO ADVISORS OF AMERICA</text>
  <text x="72" y="${H - BAND + 92}" font-family="Georgia, 'Times New Roman', serif" font-size="21" fill="#faf5ec" fill-opacity="0.85">American classics — sales, restoration &amp; service</text>
  <text x="${W - 72}" y="${H - BAND + 54}" font-family="Georgia, 'Times New Roman', serif" font-size="19" letter-spacing="3" fill="#faf5ec" fill-opacity="0.92" text-anchor="end">goldeneramotors.site</text>
  ${stock ? `<text x="${W - 72}" y="${H - BAND + 88}" font-family="Georgia, 'Times New Roman', serif" font-size="19" letter-spacing="3" fill="#faf5ec" fill-opacity="0.7" text-anchor="end">${stock}</text>` : ''}
</svg>`;

if (SRC) {
  const photo = await sharp(SRC)
    .resize(W, H, { fit: 'cover', position: 'centre' })
    .modulate({ brightness: 1.02, saturation: 0.95 })
    .toBuffer();
  await sharp(photo)
    .composite([{ input: Buffer.from(photoSvg), top: 0, left: 0 }])
    .jpeg({ quality: 88, mozjpeg: true })
    .toFile(OUT);
} else {
  await sharp(Buffer.from(posterSvg)).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);
}

const meta = await sharp(OUT).metadata();
console.log(`og written: ${OUT} -> ${meta.width}x${meta.height}${SRC ? ` (photo: ${SRC})` : ' (poster)'}`);
