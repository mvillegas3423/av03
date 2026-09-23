// Generate the illustrated "archive plates" used across the site.
//
// Every plate is drawn as vector art in the site's vintage palette (paper, ink,
// burgundy, chrome) and rendered to WebP — so the pages have real imagery
// before (and instead of) photographs, and it stays on-brand if photos never arrive.
//
// Usage: node scripts/make-scenes.mjs [output-dir]
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const OUT = process.argv[2] || path.join(process.cwd(), 'public', 'scenes');

const W = 1200;
const H = 900;

const INK = '#231a14';
const MUTED = '#6b5b4b';
const BURG = '#7a2b2b';
const CHROME = '#c8b9a0';
const CREAM = '#faf5ec';
const PAPER = '#f3ebdd';

/** classic three-box silhouette, viewBox 320x140 (matches CarSilhouette.astro) */
const CAR_PATH =
  'M16 102 L16 78 Q18 68 34 64 L92 55 L124 36 Q168 28 216 36 L274 55 Q302 61 305 71 L305 102 Z';
const carSil = (x, y, scale, color = INK, sw = 3) => `
  <g transform="translate(${x} ${y}) scale(${scale})" fill="none" stroke="${color}"
     stroke-width="${(sw / scale).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">
    <path d="${CAR_PATH}"/>
    <circle cx="76" cy="108" r="21"/>
    <circle cx="252" cy="108" r="21"/>
    <circle cx="76" cy="108" r="7"/>
    <circle cx="252" cy="108" r="7"/>
  </g>`;

const wheel = (cx, cy, r, hub = CHROME) => `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${INK}"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.4}" fill="${hub}"/>`;

const line = (x1, y1, x2, y2, stroke = INK, sw = 3, opacity = 1) =>
  `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;

const rect = (x, y, w, h, { fill = 'none', stroke = INK, sw = 4, rx = 0, opacity = 1 } = {}) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" stroke-opacity="${opacity}"/>`;

const esc = (str) =>
  String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const text = (x, y, str, { size = 24, fill = MUTED, ls = 6, anchor = 'middle', family = "Georgia, 'Times New Roman', serif", opacity = 1 } = {}) =>
  `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" letter-spacing="${ls}" fill="${fill}" fill-opacity="${opacity}" text-anchor="${anchor}">${esc(str)}</text>`;

/** repeated arcs — awning scallops, bunting, etc. */
const scallops = (x, y, width, count, r, stroke = INK, sw = 3) => {
  const step = width / count;
  let d = `M${x} ${y}`;
  for (let i = 0; i < count; i += 1) d += ` a${step / 2} ${r} 0 0 0 ${step} 0`;
  return `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}"/>`;
};

const dots = (fromX, fromY, toX, toY, cols, rows, r = 2.5, fill = INK, opacity = 0.22) => {
  let out = '';
  for (let c = 0; c < cols; c += 1) {
    for (let row = 0; row < rows; row += 1) {
      const x = fromX + ((toX - fromX) / (cols - 1)) * c;
      const y = fromY + ((toY - fromY) / (rows - 1)) * row;
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r}" fill="${fill}" fill-opacity="${opacity}"/>`;
    }
  }
  return out;
};

const defs = `
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#f9f3e7"/>
      <stop offset="0.6" stop-color="#f3ebdd"/>
      <stop offset="1" stop-color="#e9dcc4"/>
    </linearGradient>
    <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <line x1="0" y1="0" x2="0" y2="7" stroke="${INK}" stroke-opacity="0.045" stroke-width="1"/>
    </pattern>
    <radialGradient id="vignette" cx="0.5" cy="0.45" r="0.75">
      <stop offset="0.55" stop-color="#231a14" stop-opacity="0"/>
      <stop offset="1" stop-color="#231a14" stop-opacity="0.07"/>
    </radialGradient>
  </defs>`;

/** paper + double rule + archival caption, common to every plate */
const plate = ({ art, caption, index }) => `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  ${defs}
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <rect width="${W}" height="${H}" fill="url(#hatch)"/>
  <rect x="26" y="26" width="${W - 52}" height="${H - 52}" fill="none" stroke="${INK}" stroke-opacity="0.3" stroke-width="3"/>
  <rect x="38" y="38" width="${W - 76}" height="${H - 76}" fill="none" stroke="${BURG}" stroke-opacity="0.34" stroke-width="1"/>

  ${art}

  <rect width="${W}" height="${H}" fill="url(#vignette)"/>
  ${text(90, 92, `PL. ${String(index).padStart(2, '0')}`, { size: 22, ls: 5, anchor: 'start' })}
  ${text(W - 90, 92, 'AUTO ADVISORS OF AMERICA', { size: 22, ls: 5, anchor: 'end', opacity: 0.8 })}
  <line x1="90" y1="812" x2="${W - 90}" y2="812" stroke="${INK}" stroke-opacity="0.22" stroke-width="1.5"/>
  ${text(W / 2, 856, caption, { size: 25, ls: 8, fill: INK, opacity: 0.78 })}
</svg>`;

const scenes = {
  /* ------------------------------------------------ restoration */
  'service-restoration': {
    caption: 'FRAME-OFF RESTORATION',
    art: `
      ${line(90, 740, 1110, 740, INK, 3, 0.3)}
      ${rect(250, 248, 700, 26, { fill: CHROME, sw: 4, rx: 4 })}
      ${rect(252, 274, 42, 466, { fill: CREAM, sw: 4 })}
      ${rect(906, 274, 42, 466, { fill: CREAM, sw: 4 })}
      ${rect(294, 520, 266, 20, { fill: CHROME, sw: 3.5 })}
      ${rect(640, 520, 266, 20, { fill: CHROME, sw: 3.5 })}
      <g transform="translate(340 346) scale(1.7)" fill="none" stroke="${INK}"
         stroke-width="${(3.2 / 1.7).toFixed(2)}" stroke-linejoin="round" stroke-linecap="round">
        <path d="${CAR_PATH}"/>
      </g>
      <path d="M600 540 L600 592" stroke="${INK}" stroke-width="4" stroke-opacity="0.4"/>
      <path d="M480 540 L480 570 M720 540 L720 570" stroke="${INK}" stroke-width="4" stroke-opacity="0.4"/>
      ${wheel(430, 700, 42)}
      ${wheel(800, 700, 42)}
      ${rect(104, 512, 160, 178, { fill: CREAM, sw: 4, rx: 8 })}
      ${line(126, 552, 242, 552, INK, 3, 0.35)}
      ${line(126, 594, 242, 594, INK, 3, 0.35)}
      ${line(126, 636, 242, 636, INK, 3, 0.35)}
      ${wheel(138, 712, 24)}
      ${wheel(230, 712, 24)}
      ${rect(1010, 640, 120, 30, { fill: INK, sw: 0, rx: 14, opacity: 0.75 })}
      ${rect(1010, 678, 120, 30, { fill: INK, sw: 0, rx: 14, opacity: 0.55 })}
      ${rect(1010, 716, 120, 24, { fill: INK, sw: 0, rx: 12, opacity: 0.35 })}
    `,
  },

  'service-engine': {
    caption: 'MATCHING-NUMBERS V8',
    art: `
      ${line(140, 736, 1060, 736, INK, 3, 0.3)}
      <path d="M560 366 L640 366 L616 300 L584 300 Z" fill="${INK}" fill-opacity="0.85"/>
      ${rect(392, 300, 168, 66, { fill: CHROME, sw: 4, rx: 16 })}
      ${rect(640, 300, 168, 66, { fill: CHROME, sw: 4, rx: 16 })}
      ${rect(380, 366, 440, 264, { fill: CREAM, sw: 4.5, rx: 8 })}
      ${[420, 466, 512, 558, 660, 706, 752, 798].map((x) => line(x, 300, x, 268, INK, 4)).join('')}
      ${[420, 466, 512, 558, 660, 706, 752, 798].map((x) => `<circle cx="${x}" cy="258" r="11" fill="${CREAM}" stroke="${INK}" stroke-width="3.5"/>`).join('')}
      <path d="M380 404 C328 412 300 462 302 520" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M380 448 C338 456 318 500 320 552" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M380 492 C348 502 336 542 338 592" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M380 536 C358 548 354 584 356 626" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M820 404 C872 412 900 462 898 520" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M820 448 C862 456 882 500 880 552" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M820 492 C852 502 864 542 862 592" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M820 536 C842 548 846 584 844 626" fill="none" stroke="${INK}" stroke-width="5"/>
      <rect x="452" y="436" width="296" height="60" rx="30" fill="none" stroke="${INK}" stroke-width="3.5"/>
      <circle cx="482" cy="466" r="30" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      <circle cx="718" cy="466" r="30" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      <circle cx="482" cy="466" r="9" fill="${INK}" fill-opacity="0.7"/>
      <circle cx="718" cy="466" r="9" fill="${INK}" fill-opacity="0.7"/>
      <circle cx="600" cy="570" r="46" fill="${CREAM}" stroke="${INK}" stroke-width="4.5"/>
      <circle cx="600" cy="570" r="15" fill="${INK}" fill-opacity="0.75"/>
      ${rect(432, 640, 336, 44, { fill: INK, sw: 4, rx: 6, opacity: 0.85 })}
    `,
  },

  'service-bodywork': {
    caption: 'LACQUER & BODY WORK',
    art: `
      ${line(120, 736, 1080, 736, INK, 3, 0.3)}
      <path d="M880 226 C960 236 1010 320 1024 430 C1034 520 1014 630 962 700" fill="${CREAM}" stroke="${INK}" stroke-width="5"/>
      <path d="M906 300 C950 316 976 372 984 448" fill="none" stroke="${INK}" stroke-width="3" stroke-opacity="0.4"/>
      ${rect(210, 356, 236, 96, { fill: INK, sw: 4, rx: 14 })}
      <path d="M300 300 L392 300 L376 356 L316 356 Z" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      ${rect(446, 380, 46, 44, { fill: CHROME, sw: 4, rx: 6 })}
      ${rect(238, 452, 62, 130, { fill: INK, sw: 4, rx: 12, opacity: 0.9 })}
      <path d="M300 452 L336 452 L336 500 L300 500 Z" fill="${BURG}" stroke="${INK}" stroke-width="3"/>
      ${Array.from({ length: 34 })
        .map((_, i) => {
          const t = i / 33;
          const x = 516 + t * 330;
          const spread = 20 + t * 165;
          const y = 404 + Math.sin(i * 2.3) * spread;
          const r = 3 + (1 - t) * 4;
          return `<circle cx="${(x + (i % 3) * 9).toFixed(1)}" cy="${(y + (i % 5) * 7 - 14).toFixed(1)}" r="${r.toFixed(1)}" fill="${BURG}" fill-opacity="${(0.75 - t * 0.5).toFixed(2)}"/>`;
        })
        .join('')}
      <path d="M546 356 C620 340 700 350 776 372" fill="none" stroke="${INK}" stroke-width="2.5" stroke-opacity="0.35" stroke-dasharray="12 12"/>
    `,
  },

  'service-chrome': {
    caption: 'SHOW PLATING & TRIM',
    art: `
      ${rect(268, 176, 664, 24, { fill: CHROME, sw: 4, rx: 12 })}
      ${rect(276, 200, 648, 248, { fill: CREAM, sw: 4 })}
      ${Array.from({ length: 17 }).map((_, i) => line(296 + i * 38.5, 210, 296 + i * 38.5, 438, INK, 4, 0.32)).join('')}
      ${rect(264, 400, 672, 10, { fill: INK, sw: 0, opacity: 0.5 })}
      <circle cx="600" cy="306" r="60" fill="${CREAM}" stroke="${BURG}" stroke-width="6"/>
      <path d="M566 278 L600 350 L634 278" fill="none" stroke="${BURG}" stroke-width="6" stroke-linecap="round"/>
      ${rect(190, 486, 820, 92, { fill: CHROME, sw: 4.5, rx: 46 })}
      ${rect(406, 462, 54, 150, { fill: CHROME, sw: 4, rx: 24 })}
      ${rect(740, 462, 54, 150, { fill: CHROME, sw: 4, rx: 24 })}
      <circle cx="433" cy="462" r="34" fill="${CHROME}" stroke="${INK}" stroke-width="4"/>
      <circle cx="767" cy="462" r="34" fill="${CHROME}" stroke="${INK}" stroke-width="4"/>
      ${rect(536, 606, 128, 74, { fill: CREAM, sw: 3.5, rx: 4 })}
      ${text(600, 654, '1978', { size: 30, ls: 2, fill: MUTED, opacity: 0.9 })}
      ${line(120, 700, 1080, 700, INK, 3, 0.25)}
    `,
  },

  'service-interior': {
    caption: 'PERIOD INTERIORS',
    art: `
      ${rect(180, 228, 840, 118, { fill: CHROME, sw: 4, rx: 10 })}
      <circle cx="404" cy="287" r="52" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      <circle cx="404" cy="287" r="7" fill="${INK}"/>
      ${Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return line(404 + Math.cos(a) * 40, 287 + Math.sin(a) * 40, 404 + Math.cos(a) * 48, 287 + Math.sin(a) * 48, INK, 3, 0.7);
      }).join('')}
      <circle cx="566" cy="287" r="38" fill="${CREAM}" stroke="${INK}" stroke-width="4"/>
      <circle cx="566" cy="287" r="6" fill="${BURG}"/>
      ${rect(700, 258, 70, 58, { fill: CREAM, sw: 3.5, rx: 6 })}
      ${rect(800, 258, 70, 58, { fill: CREAM, sw: 3.5, rx: 6 })}
      ${rect(900, 258, 70, 58, { fill: CREAM, sw: 3.5, rx: 6 })}
      ${rect(206, 560, 788, 118, { fill: CREAM, sw: 4.5, rx: 26 })}
      ${rect(186, 664, 828, 84, { fill: CREAM, sw: 4.5, rx: 20 })}
      ${dots(250, 592, 950, 646, 7, 3, 7, CHROME)}
      ${line(206, 626, 994, 626, INK, 2.5, 0.25)}
      ${line(186, 686, 1014, 686, INK, 2.5, 0.25)}
      <circle cx="758" cy="470" r="104" fill="none" stroke="${INK}" stroke-width="7"/>
      <circle cx="758" cy="470" r="26" fill="${INK}"/>
      ${line(758, 496, 758, 600, INK, 26)}
      ${line(758, 470, 648, 470, INK, 15)}
      ${line(758, 470, 868, 470, INK, 15)}
      ${line(120, 776, 1080, 776, INK, 3, 0.25)}
    `,
  },

  'service-appraisal': {
    caption: 'APPRAISAL & CONSIGNMENT',
    art: `
      ${rect(352, 186, 496, 588, { fill: CREAM, sw: 5, rx: 20 })}
      ${rect(520, 150, 160, 62, { fill: CHROME, sw: 4, rx: 14 })}
      <circle cx="600" cy="181" r="9" fill="${INK}"/>
      ${[300, 366, 432, 498, 564].map((y) => line(404, y, 796, y, INK, 3.5, 0.3)).join('')}
      ${[300, 366, 432, 498, 564].map((y) => rect(370, y - 14, 22, 22, { sw: 3 })).join('')}
      ${line(404, 630, 700, 630, INK, 3.5, 0.3)}
      <path d="M414 660 C470 620 500 700 552 664 C596 634 620 690 668 660" fill="none" stroke="${BURG}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="806" cy="656" r="96" fill="none" stroke="${BURG}" stroke-width="7" stroke-opacity="0.85"/>
      <circle cx="806" cy="656" r="76" fill="none" stroke="${BURG}" stroke-width="3" stroke-opacity="0.7"/>
      ${text(806, 648, 'APPRAISED', { size: 22, ls: 2, fill: BURG, opacity: 0.9 })}
      ${text(806, 682, 'PL. 1978', { size: 18, ls: 3, fill: BURG, opacity: 0.7 })}
      ${line(120, 806, 1080, 806, INK, 3, 0.2)}
    `,
  },

  /* ------------------------------------------------ shipping */
  'shipping-enclosed': {
    caption: 'ENCLOSED TRANSPORT',
    art: `
      ${rect(432, 236, 606, 24, { fill: CHROME, sw: 4, rx: 6 })}
      ${rect(438, 260, 594, 372, { fill: CREAM, sw: 5, rx: 10 })}
      ${Array.from({ length: 9 }).map((_, i) => line(492 + i * 60, 274, 492 + i * 60, 620, INK, 3, 0.2)).join('')}
      ${rect(962, 288, 52, 316, { sw: 3.5 })}
      ${line(988, 300, 988, 592, INK, 3, 0.3)}
      <path d="M438 606 L330 606 L300 660" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <circle cx="288" cy="678" r="13" fill="${INK}"/>
      ${rect(150, 420, 182, 186, { fill: CREAM, sw: 5, rx: 12 })}
      ${rect(170, 448, 76, 74, { fill: 'none', sw: 3.5 })}
      ${line(150, 512, 332, 512, INK, 3, 0.3)}
      ${wheel(566, 660, 50)}
      ${wheel(920, 660, 50)}
      ${rect(512, 700, 108, 18, { fill: INK, sw: 0, opacity: 0.65, rx: 4 })}
      ${rect(866, 700, 108, 18, { fill: INK, sw: 0, opacity: 0.65, rx: 4 })}
      ${line(100, 730, 1100, 730, INK, 3, 0.28)}
    `,
  },

  'shipping-open': {
    caption: 'OPEN MULTI-CAR CARRIER',
    art: `
      ${line(80, 792, 1120, 792, INK, 3, 0.28)}
      ${rect(96, 440, 148, 160, { fill: CREAM, sw: 5, rx: 10 })}
      ${rect(114, 466, 66, 62, { fill: 'none', sw: 3.5 })}
      ${line(96, 528, 244, 528, INK, 3, 0.3)}
      ${rect(244, 470, 40, 132, { fill: CREAM, sw: 4 })}
      ${rect(284, 574, 776, 26, { fill: CHROME, sw: 4, rx: 4 })}
      ${rect(344, 322, 716, 24, { fill: CHROME, sw: 4, rx: 4 })}
      ${[310, 900, 1020].map((x) => rect(x, 346, 22, 228, { fill: CREAM, sw: 3 })).join('')}
      ${[300, 620, 950].map((x) => rect(x, 600, 22, 152, { fill: CREAM, sw: 3 })).join('')}
      ${carSil(352, 148, 1.35, INK, 3)}
      ${carSil(346, 380, 1.5, INK, 3)}
      ${wheel(176, 726, 44)}
      ${wheel(430, 726, 44)}
      ${wheel(700, 726, 44)}
      ${wheel(950, 726, 44)}
    `,
  },

  'shipping-expedited': {
    caption: 'EXPEDITED DELIVERY',
    art: `
      ${line(80, 520, 210, 520, BURG, 6, 0.75)}
      ${line(60, 556, 210, 556, BURG, 6, 0.5)}
      ${line(80, 592, 190, 592, BURG, 6, 0.32)}
      ${rect(210, 546, 780, 26, { fill: CHROME, sw: 4, rx: 4 })}
      ${rect(216, 430, 150, 142, { fill: CREAM, sw: 5, rx: 10 })}
      ${rect(236, 456, 70, 60, { fill: 'none', sw: 3.5 })}
      ${rect(366, 430, 64, 142, { fill: CREAM, sw: 4 })}
      ${carSil(400, 346, 1.55, INK, 3.2)}
      ${wheel(300, 620, 46)}
      ${wheel(620, 620, 46)}
      ${wheel(880, 620, 46)}
      <circle cx="1000" cy="252" r="86" fill="${CREAM}" stroke="${BURG}" stroke-width="6"/>
      <circle cx="1000" cy="252" r="6" fill="${INK}"/>
      ${line(1000, 252, 1000, 194, INK, 5)}
      ${line(1000, 252, 1050, 268, INK, 5)}
      ${Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2;
        return line(1000 + Math.cos(a) * 70, 252 + Math.sin(a) * 70, 1000 + Math.cos(a) * 80, 252 + Math.sin(a) * 80, INK, 3, 0.6);
      }).join('')}
      ${line(80, 686, 1120, 686, INK, 3, 0.28)}
    `,
  },

  'shipping-export': {
    caption: 'EXPORT & CONTAINER LOADING',
    art: `
      ${rect(168, 646, 700, 24, { fill: CHROME, sw: 4, rx: 4 })}
      ${rect(190, 316, 640, 330, { fill: CREAM, sw: 5, rx: 4 })}
      ${Array.from({ length: 16 }).map((_, i) => line(224 + i * 38, 336, 224 + i * 38, 626, INK, 3, 0.22)).join('')}
      ${rect(740, 336, 68, 290, { sw: 3.5 })}
      ${line(774, 352, 774, 610, INK, 3, 0.3)}
      <circle cx="990" cy="404" r="150" fill="${CREAM}" stroke="${INK}" stroke-width="5"/>
      <ellipse cx="990" cy="404" rx="150" ry="58" fill="none" stroke="${INK}" stroke-width="3" stroke-opacity="0.55"/>
      <ellipse cx="990" cy="404" rx="150" ry="112" fill="none" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>
      <ellipse cx="990" cy="404" rx="62" ry="150" fill="none" stroke="${INK}" stroke-width="3" stroke-opacity="0.55"/>
      <ellipse cx="990" cy="404" rx="116" ry="150" fill="none" stroke="${INK}" stroke-width="3" stroke-opacity="0.35"/>
      <path d="M892 340 C930 320 968 342 1002 328 C1036 314 1066 330 1084 352 C1050 372 1020 366 992 380 C960 396 920 384 892 340 Z" fill="${CHROME}" fill-opacity="0.85"/>
      <path d="M836 452 C900 436 946 470 928 508" fill="none" stroke="${BURG}" stroke-width="6" stroke-dasharray="20 16" stroke-linecap="round"/>
      <path d="M916 496 L932 516 L906 518 Z" fill="${BURG}"/>
      ${line(100, 690, 1100, 690, INK, 3, 0.28)}
    `,
  },

  /* ------------------------------------------------ about */
  'about-storefront': {
    caption: 'THE SHOP · FEDORA CIRCLE',
    art: `
      <path d="M120 156 Q600 236 1080 156" fill="none" stroke="${INK}" stroke-width="3" stroke-opacity="0.5"/>
      ${[160, 260, 360, 460, 560, 660, 760, 860, 960, 1040]
        .map((x, i) => {
          const y = 168 + Math.sin((x / 1080) * Math.PI) * 46;
          const fill = i % 2 === 0 ? BURG : CHROME;
          return `<path d="M${x} ${y} L${x + 34} ${y} L${x + 17} ${y + 46} Z" fill="${fill}" fill-opacity="0.85"/>`;
        })
        .join('')}
      ${rect(180, 226, 840, 494, { fill: CREAM, sw: 5, rx: 4 })}
      <rect x="180" y="248" width="840" height="108" fill="${BURG}" stroke="${INK}" stroke-width="5"/>
      ${text(600, 292, 'EST. 1978 · BROOKSVILLE, FLORIDA', { size: 20, ls: 7, fill: CREAM, opacity: 0.85 })}
      ${text(600, 336, 'AUTO ADVISORS OF AMERICA', { size: 38, ls: 4, fill: CREAM })}
      ${rect(150, 356, 900, 42, { fill: CHROME, sw: 4 })}
      ${scallops(150, 398, 900, 18, 22)}
      ${rect(226, 452, 348, 236, { fill: PAPER, sw: 4 })}
      ${rect(626, 452, 348, 236, { fill: PAPER, sw: 4 })}
      ${Array.from({ length: 7 }).map((_, i) => line(240, 486 + i * 32, 560, 486 + i * 32, INK, 3, 0.22)).join('')}
      ${Array.from({ length: 7 }).map((_, i) => line(640, 486 + i * 32, 960, 486 + i * 32, INK, 3, 0.22)).join('')}
      ${rect(596, 430, 12, 258, { fill: INK, sw: 0, opacity: 0.5 })}
      <circle cx="602" cy="420" r="17" fill="${CREAM}" stroke="${INK}" stroke-width="3.5"/>
      <path d="M602 437 L566 506 L638 506 Z" fill="${CHROME}" fill-opacity="0.45"/>
      ${line(120, 700, 1080, 700, INK, 3, 0.3)}
      ${rect(150, 700, 900, 22, { fill: CHROME, sw: 3, rx: 3 })}
    `,
  },

  'about-workshop': {
    caption: 'THE BENCH · TOOLS OF THE TRADE',
    art: `
      ${rect(200, 170, 800, 372, { fill: CREAM, sw: 4.5, rx: 8 })}
      ${dots(224, 194, 976, 518, 20, 9, 2.4, INK, 0.2)}
      <circle cx="344" cy="288" r="40" fill="none" stroke="${INK}" stroke-width="6"/>
      <path d="M362 288 L353 303.6 L335 303.6 L326 288 L335 272.4 L353 272.4 Z" fill="${CHROME}" stroke="${INK}" stroke-width="3"/>
      ${rect(344, 278, 208, 20, { fill: INK, sw: 0, rx: 6, opacity: 0.85 })}
      <circle cx="576" cy="288" r="36" fill="none" stroke="${INK}" stroke-width="6"/>
      <path d="M592 288 L584 301.9 L568 301.9 L560 288 L568 274.1 L584 274.1 Z" fill="${CHROME}" stroke="${INK}" stroke-width="3"/>
      ${[672, 728, 784].map((x, i) => `
        ${rect(x - 13, 226, 26, 92, { fill: i === 1 ? CHROME : BURG, sw: 3.5, rx: 13 })}
        ${rect(x - 5, 318, 10, 140, { fill: CREAM, sw: 3 })}
        ${line(x, 458, x, 476, INK, 6)}
      `).join('')}
      <path d="M856 240 L936 240 L926 268 L866 268 Z" fill="${INK}" fill-opacity="0.85"/>
      ${rect(892, 268, 18, 168, { fill: CREAM, sw: 3.5, rx: 8 })}
      ${rect(150, 570, 900, 42, { fill: CHROME, sw: 4.5, rx: 6 })}
      ${line(150, 612, 1050, 612, INK, 3, 0.35)}
      ${[214, 500, 786, 1000].map((x) => rect(x, 612, 34, 172, { fill: CREAM, sw: 4 })).join('')}
      ${rect(250, 486, 96, 84, { fill: CREAM, sw: 4, rx: 8 })}
      ${rect(268, 452, 60, 36, { fill: CHROME, sw: 3.5, rx: 6 })}
      <circle cx="298" cy="528" r="16" fill="none" stroke="${INK}" stroke-width="3.5"/>
      ${rect(700, 500, 116, 70, { fill: CREAM, sw: 4, rx: 6 })}
      ${rect(686, 480, 144, 24, { fill: CHROME, sw: 3.5, rx: 8 })}
      ${line(816, 536, 878, 536, INK, 7)}
      <circle cx="886" cy="536" r="11" fill="${INK}"/>
      ${line(120, 792, 1080, 792, INK, 3, 0.28)}
    `,
  },

  /* ------------------------------------------------ contacts */
  'contacts-map': {
    caption: '29211 FEDORA CIRCLE · BROOKSVILLE',
    art: `
      ${Array.from({ length: 7 }).map((_, i) => line(80, 200 + i * 90, 1120, 200 + i * 90, INK, 3, 0.12)).join('')}
      ${Array.from({ length: 9 }).map((_, i) => line(140 + i * 118, 150, 140 + i * 118, 780, INK, 3, 0.12)).join('')}
      <path d="M60 640 C240 566 400 720 620 656 C820 598 980 690 1160 610" fill="none" stroke="${CHROME}" stroke-width="34" stroke-opacity="0.75"/>
      <path d="M60 640 C240 566 400 720 620 656 C820 598 980 690 1160 610" fill="none" stroke="${INK}" stroke-width="2" stroke-opacity="0.25"/>
      ${line(140, 470, 1060, 470, INK, 8, 0.5)}
      ${line(620, 150, 620, 780, INK, 8, 0.5)}
      ${line(380, 290, 900, 520, INK, 6, 0.3)}
      <path d="M180 748 C380 690 520 600 700 546 C860 498 980 452 1042 386" fill="none" stroke="${BURG}" stroke-width="7" stroke-dasharray="24 18" stroke-linecap="round"/>
      <circle cx="180" cy="748" r="16" fill="${CREAM}" stroke="${BURG}" stroke-width="5"/>
      <path d="M1042 470 C1006 424 982 402 982 368 A60 60 0 1 1 1102 368 C1102 402 1078 424 1042 470 Z" fill="${BURG}" stroke="${INK}" stroke-width="4"/>
      <circle cx="1042" cy="364" r="22" fill="${CREAM}"/>
      ${[[300, 330], [760, 640], [420, 660], [880, 260]].map(([x, y]) => rect(x - 11, y - 11, 22, 22, { fill: INK, sw: 0, opacity: 0.4 })).join('')}
      <g transform="translate(214 208)">
        <circle r="62" fill="${CREAM}" stroke="${INK}" stroke-width="3.5"/>
        <path d="M0 -54 L14 0 L0 54 L-14 0 Z" fill="${BURG}" fill-opacity="0.9"/>
        <path d="M-54 0 L0 -14 L54 0 L0 14 Z" fill="${INK}" fill-opacity="0.75"/>
      </g>
      ${rect(80, 792, 200, 16, { fill: INK, sw: 0, opacity: 0.55 })}
      ${line(80, 784, 80, 816, INK, 3)}
      ${line(180, 784, 180, 816, INK, 3)}
      ${line(280, 784, 280, 816, INK, 3)}
    `,
  },
};

async function main() {
  await mkdir(OUT, { recursive: true });
  let index = 1;
  for (const [name, scene] of Object.entries(scenes)) {
    const svg = plate({ art: scene.art, caption: scene.caption, index });
    const file = path.join(OUT, `${name}.webp`);
    await sharp(Buffer.from(svg)).webp({ quality: 90, effort: 5 }).toFile(file);
    // smaller cut for cards and row thumbnails (~600 CSS px wide slots)
    await sharp(Buffer.from(svg))
      .resize(640, 480)
      .webp({ quality: 86, effort: 5 })
      .toFile(path.join(OUT, `${name}-card.webp`));
    const meta = await sharp(file).metadata();
    console.log(`ok: ${name}.webp (+ -card)  ${meta.width}x${meta.height}`);
    index += 1;
  }
  console.log(`\n${Object.keys(scenes).length} plates written to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
