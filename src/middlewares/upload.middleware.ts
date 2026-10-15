import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { deflateSync, inflateSync } from 'zlib';

export const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'uploads');
if (process.env.NODE_ENV === 'production' && (!process.env.UPLOADS_DIR || !path.isAbsolute(process.env.UPLOADS_DIR) || !path.relative(process.cwd(), UPLOADS_DIR).startsWith('..'))) {
  throw new Error('Production UPLOADS_DIR must be an absolute path outside the application checkout');
}
const LIMIT = 5 * 1024 * 1024;
const invalidImage = () => Object.assign(new Error('Only valid non-interlaced 8-bit PNG images up to 5 MB and 4 million pixels are accepted'), { statusCode: 400 });
const signature = Buffer.from('89504e470d0a1a0a', 'hex');
function crc32(data: Buffer): number {
  let crc = 0xffffffff;
  for (const byte of data) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  }
  return (crc ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Buffer): Buffer {
  const body = Buffer.concat([Buffer.from(type), data]);
  const size = Buffer.alloc(4); size.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([size, body, crc]);
}
/** Parse bounded PNG data, validate scanlines, and remove metadata and trailing content. */
export function sanitizePng(input: Buffer): Buffer {
  try {
    if (input.length > LIMIT || !input.subarray(0, 8).equals(signature)) throw invalidImage();
    let offset = 8;
    let header: Buffer | undefined;
    let ended = false;
    const data: Buffer[] = [];
    while (offset + 12 <= input.length) {
      const length = input.readUInt32BE(offset);
      if (length > LIMIT || offset + length + 12 > input.length) throw invalidImage();
      const type = input.toString('ascii', offset + 4, offset + 8);
      const body = input.subarray(offset + 8, offset + 8 + length);
      if (crc32(input.subarray(offset + 4, offset + 8 + length)) !== input.readUInt32BE(offset + 8 + length)) throw invalidImage();
      if (!header && type !== 'IHDR') throw invalidImage();
      if (type === 'IHDR') {
        if (header || length !== 13) throw invalidImage();
        header = body;
      } else if (type === 'IDAT') data.push(body);
      else if (type === 'IEND') { if (length !== 0) throw invalidImage(); ended = true; break; }
      else if (type[0] === type[0].toUpperCase()) throw invalidImage();
      offset += length + 12;
    }
    if (!header || !ended || !data.length) throw invalidImage();
    const width = header.readUInt32BE(0), height = header.readUInt32BE(4);
    const channels: Record<number, number> = { 0: 1, 2: 3, 4: 2, 6: 4 };
    if (!width || !height || width * height > 4_000_000 || header[8] !== 8 || !channels[header[9]] || header[10] || header[11] || header[12]) throw invalidImage();
    const stride = width * channels[header[9]] + 1;
    const pixels = inflateSync(Buffer.concat(data), { maxOutputLength: stride * height });
    if (pixels.length !== stride * height) throw invalidImage();
    for (let row = 0; row < height; row++) if (pixels[row * stride] > 4) throw invalidImage();
    return Buffer.concat([signature, chunk('IHDR', header), chunk('IDAT', deflateSync(pixels)), chunk('IEND', Buffer.alloc(0))]);
  } catch { throw invalidImage(); }
}
export const uploadImageMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: LIMIT, files: 1, fields: 4, fieldSize: 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'image/png' || path.extname(file.originalname).toLowerCase() !== '.png') return cb(invalidImage());
    cb(null, true);
  },
});
export async function saveImage(buffer: Buffer): Promise<string> {
  const safe = sanitizePng(buffer);
  await fs.mkdir(UPLOADS_DIR, { recursive: true, mode: 0o700 });
  const filename = crypto.randomUUID() + '.png';
  await fs.writeFile(path.join(UPLOADS_DIR, filename), safe, { flag: 'wx', mode: 0o600 });
  return '/uploads/' + filename;
}
export const saveBase64Image = async (dataUrl: string): Promise<string> => {
  if (dataUrl.length > Math.ceil(LIMIT * 4 / 3) + 32 || !/^data:image\/png;base64,[A-Za-z0-9+/]+={0,2}$/.test(dataUrl)) throw invalidImage();
  return saveImage(Buffer.from(dataUrl.slice(dataUrl.indexOf(',') + 1), 'base64'));
};
