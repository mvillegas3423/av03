// Generate the placeholder hero backdrop (paper-toned vintage plate).
// Used until real shop / car photography replaces it.
// Usage: node scripts/make-hero.mjs [output]
import sharp from 'sharp';

const OUT = process.argv[2] || 'public/hero.jpg';
const W = 1600;
const H = 1100;

const svg = `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f7f0e4"/>
      <stop offset="0.55" stop-color="#efe4d1"/>
      <stop offset="1" stop-color="#e4d6bd"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.72" cy="0.28" r="0.68">
      <stop offset="0" stop-color="#c8b9a0" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#c8b9a0" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="warm" cx="0.18" cy="0.85" r="0.55">
      <stop offset="0" stop-color="#7a2b2b" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#7a2b2b" stop-opacity="0"/>
    </radialGradient>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="#231a14" stroke-opacity="0.035" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  <rect width="${W}" height="${H}" fill="url(#warm)"/>
  <rect width="${W}" height="${H}" fill="url(#hatch)"/>

  <text x="${W / 2}" y="${H / 2 + 90}" font-family="Georgia, 'Times New Roman', serif" font-size="300" letter-spacing="26" fill="#231a14" fill-opacity="0.07" text-anchor="middle">1978</text>

  <rect x="70" y="70" width="${W - 140}" height="${H - 140}" fill="none" stroke="#231a14" stroke-opacity="0.22" stroke-width="3"/>
  <rect x="84" y="84" width="${W - 168}" height="${H - 168}" fill="none" stroke="#7a2b2b" stroke-opacity="0.35" stroke-width="1"/>

  <text x="${W / 2}" y="150" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="12" fill="#6b5b4b" text-anchor="middle">BROOKSVILLE · FLORIDA</text>
  <text x="${W / 2}" y="${H - 130}" font-family="Georgia, 'Times New Roman', serif" font-size="22" letter-spacing="12" fill="#6b5b4b" text-anchor="middle">AMERICAN CLASSICS · SALES &amp; RESTORATION</text>
</svg>`;

await sharp(Buffer.from(svg)).jpeg({ quality: 88, mozjpeg: true }).toFile(OUT);

const meta = await sharp(OUT).metadata();
console.log(`hero backdrop written: ${OUT} -> ${meta.width}x${meta.height}`);
