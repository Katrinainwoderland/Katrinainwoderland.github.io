import { Jimp } from 'jimp';
import { readdirSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

async function shrinkToJpeg(srcPath, destPath, maxWidth, quality) {
  const img = await Jimp.read(srcPath);
  if (img.width > maxWidth) {
    img.resize({ w: maxWidth });
  }
  const buf = await img.getBuffer('image/jpeg', { quality });
  writeFileSync(destPath, buf);
}

async function main() {
  const before = totalSize('photos');

  // 1. Deck screenshots: massive 5K PNGs -> resized JPEGs
  const deckDir = 'photos/decks';
  for (const file of readdirSync(deckDir)) {
    if (!file.endsWith('.png')) continue;
    const base = file.replace(/\.png$/, '');
    const src = join(deckDir, file);
    const dest = join(deckDir, base + '.jpg');
    await shrinkToJpeg(src, dest, 1600, 78);
    unlinkSync(src);
    console.log('deck:', file, '->', base + '.jpg');
  }

  // 2. Oversized portrait photos
  const portraits = [
    ['photos/rn-cover.jpg', 900, 80],
    ['photos/about1.jpg', 900, 80],
    ['photos/about 2.jpg', 900, 80],
    ['photos/about 3.jpg', 900, 80],
    ['photos/contact-photo.jpg', 700, 82],
  ];
  for (const [path, maxW, q] of portraits) {
    const img = await Jimp.read(path);
    if (img.width > maxW) img.resize({ w: maxW });
    const buf = await img.getBuffer('image/jpeg', { quality: q });
    writeFileSync(path, buf);
    console.log('portrait:', path);
  }

  const after = totalSize('photos');
  console.log(`\nphotos/ total: ${(before/1024/1024).toFixed(1)}MB -> ${(after/1024/1024).toFixed(1)}MB`);
}

function totalSize(dir) {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) total += totalSize(p);
    else total += statSync(p).size;
  }
  return total;
}

main();
