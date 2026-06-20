import { Jimp } from 'jimp';

const img = await Jimp.read('photos/Hero.png');
const w = img.bitmap.width;
const h = img.bitmap.height;

const fadeLeft   = Math.floor(w * 0.20);
const fadeBottom = Math.floor(h * 0.25);

img.scan(0, 0, w, h, function(x, y, idx) {
  let alpha = this.bitmap.data[idx + 3];

  // 左侧淡出
  if (x < fadeLeft) {
    alpha *= x / fadeLeft;
  }

  // 底部淡出
  const fromBottom = h - y;
  if (fromBottom < fadeBottom) {
    alpha *= fromBottom / fadeBottom;
  }

  this.bitmap.data[idx + 3] = Math.round(alpha);
});

await img.write('photos/Hero.png');
console.log('Done — edges faded into alpha channel');
