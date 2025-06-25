import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 检查图片是否有效
function isValidImage(filePath) {
  try {
    const buffer = fs.readFileSync(filePath);
    // PNG文件头: 89 50 4E 47 0D 0A 1A 0A
    const pngHeader = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
    // JPG文件头: FF D8 FF
    const jpgHeader = Buffer.from([0xFF, 0xD8, 0xFF]);
    if (buffer.slice(0, 8).equals(pngHeader)) return 'PNG';
    if (buffer.slice(0, 3).equals(jpgHeader)) return 'JPG';
    return false;
  } catch (e) {
    return false;
  }
}

function checkDirImages(dir) {
  const absDir = path.resolve(__dirname, dir);
  const files = fs.readdirSync(absDir);
  let result = [];
  files.forEach(file => {
    const filePath = path.join(absDir, file);
    if (fs.statSync(filePath).isFile()) {
      const type = isValidImage(filePath);
      result.push({ file, type });
    }
  });
  return result;
}

console.log('检测 public/icons 下的图片:');
const icons = checkDirImages('./public/icons');
icons.forEach(img => {
  if (!img.type) {
    console.log(`❌ ${img.file} 不是有效图片`);
  } else {
    console.log(`✅ ${img.file} 是有效的 ${img.type} 图片`);
  }
});

console.log('\n检测 public/img 下的图片:');
const imgs = checkDirImages('./public/img');
imgs.forEach(img => {
  if (!img.type) {
    console.log(`❌ ${img.file} 不是有效图片`);
  } else {
    console.log(`✅ ${img.file} 是有效的 ${img.type} 图片`);
  }
}); 