// Simple standalone PNG generator for PWA icons
// Generates valid PNG images for PWA manifest without external dependencies
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPNG(width, height, isMaskable = false) {
  // RGBA buffer: 4 bytes per pixel + 1 filter byte per row
  const rowSize = width * 4 + 1;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const outerR = Math.min(width, height) * (isMaskable ? 0.38 : 0.44);
  const innerR = outerR * 0.45;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter byte: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;
      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background: Deep abyssal black / dark navy (#05050c)
      let r = 5, g = 5, b = 12, a = 255;

      // Sonar rings
      if (Math.abs(dist - outerR) < 3) {
        r = 56; g = 189; b = 248; // cyan
      } else if (Math.abs(dist - outerR * 0.8) < 2) {
        r = 239; g = 68; b = 68; // crimson
      } else if (Math.abs(dist - outerR * 0.6) < 2) {
        r = 14; g = 165; b = 233; // light cyan
      }

      // Bulkhead ring
      if (dist < outerR * 0.55 && dist > outerR * 0.4) {
        r = 30; g = 41; b = 59;
      }

      // Glowing red ocular core
      if (dist < innerR) {
        const glow = 1 - (dist / innerR);
        r = Math.min(255, 220 + Math.round(glow * 35));
        g = Math.round(glow * 50);
        b = Math.round(glow * 50);
      }

      // Central white pupil dot
      if (dist < innerR * 0.2) {
        r = 255; g = 255; b = 255;
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);

  // PNG Signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // Bit depth: 8
  ihdrData[9] = 6; // Color type: 6 (RGBA)
  ihdrData[10] = 0; // Compression: Deflate
  ihdrData[11] = 0; // Filter method
  ihdrData[12] = 0; // Interlace: None
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // IDAT chunk
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = data.length;
  const chunk = Buffer.alloc(8 + len + 4);
  chunk.writeUInt32BE(len, 0);
  typeBuf.copy(chunk, 4);
  data.copy(chunk, 8);
  const crc = crc32(Buffer.concat([typeBuf, data]));
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (~c) >>> 0;
}

const table = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  table[n] = c;
}

const publicDir = path.resolve('public');
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, false));

// Generate valid ICO wrapper containing 32x32 PNG
const png32 = createPNG(32, 32, false);
const icoHeader = Buffer.alloc(22);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // ICO type
icoHeader.writeUInt16LE(1, 4); // 1 image
icoHeader.writeUInt8(32, 6);   // width
icoHeader.writeUInt8(32, 7);   // height
icoHeader.writeUInt8(0, 8);    // colors
icoHeader.writeUInt8(0, 9);    // reserved
icoHeader.writeUInt16LE(1, 10); // planes
icoHeader.writeUInt16LE(32, 12); // bpp
icoHeader.writeUInt32LE(png32.length, 14); // image size
icoHeader.writeUInt32LE(22, 18); // offset
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), Buffer.concat([icoHeader, png32]));

console.log('Successfully generated PWA icon assets: 192, 512, maskable, apple-touch-icon, and favicon.ico');
