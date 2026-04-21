const fs = require('fs');
const crypto = require('crypto');

const CHUNK = 65536;

/**
 * Перезаписывает файл случайными байтами перед удалением (базовая защита от простого восстановления).
 * Для РК: «қауіпсіз жою» загруженных файлов (аватары и т.п.).
 */
function secureUnlinkSync(absPath) {
  if (!absPath || !fs.existsSync(absPath)) return;
  const stat = fs.statSync(absPath);
  if (!stat.isFile()) {
    fs.unlinkSync(absPath);
    return;
  }
  const { size } = stat;
  const fd = fs.openSync(absPath, 'r+');
  try {
    let written = 0;
    while (written < size) {
      const len = Math.min(CHUNK, size - written);
      const buf = Buffer.allocUnsafe(len);
      crypto.randomFillSync(buf);
      fs.writeSync(fd, buf, 0, len, written);
      written += len;
    }
    fs.fsyncSync(fd);
  } finally {
    fs.closeSync(fd);
  }
  fs.unlinkSync(absPath);
}

module.exports = { secureUnlinkSync };
