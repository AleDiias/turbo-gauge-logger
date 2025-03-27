import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sizes = [512, 384, 192, 144, 96, 72, 48, 36];

async function generateIcons() {
  const svgBuffer = fs.readFileSync(path.join(__dirname, '../src/assets/icon.svg'));
  
  for (const size of sizes) {
    await sharp(svgBuffer)
      .resize(size, size)
      .png()
      .toFile(path.join(__dirname, `../src/assets/icon-${size}.png`));
  }
}

generateIcons().catch(console.error); 