import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fonction pour créer une icône SVG simple
function createSVG(size) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size/8}" fill="url(#gradient)"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/3}" font-weight="bold" text-anchor="middle" dominant-baseline="middle" fill="white">P</text>
</svg>`;
}

// Tailles d'icônes nécessaires
const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512];

console.log('Génération des icônes PWA...');

sizes.forEach(size => {
  const svgContent = createSVG(size);
  const filename = `icon-${size}x${size}.svg`;
  const filepath = path.join(__dirname, filename);
  
  fs.writeFileSync(filepath, svgContent);
  console.log(`✅ ${filename} créé`);
});

console.log('\n🎉 Toutes les icônes SVG ont été créées !');
console.log('📝 Note: Pour une PWA complète, convertissez ces SVG en PNG avec un outil comme ImageMagick ou un convertisseur en ligne.');
