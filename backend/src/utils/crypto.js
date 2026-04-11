const crypto = require('crypto');

// Рекомендуется хранить секретный ключ в переменных окружения
// Для демонстрации используем фиксированный ключ, если он не задан
const ENCRYPTION_KEY = (process.env.ENCRYPTION_KEY || 'your-secret-key-32-chars-long-!!').padEnd(32, '0').slice(0, 32); 
const IV_LENGTH = 16; // Для AES
const ALGORITHM = 'aes-256-gcm';

/**
 * Шифрует текст с использованием AES-256-GCM
 * @param {string} text 
 * @returns {string} зашифрованный текст в формате iv:authTag:encryptedText
 */
function encrypt(text) {
  if (!text) return text;
  
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Дешифрует текст
 * @param {string} text зашифрованный текст в формате iv:authTag:encryptedText
 * @returns {string} исходный текст
 */
function decrypt(text) {
  if (!text || !text.includes(':')) return text;
  
  try {
    const [ivHex, authTagHex, encryptedText] = text.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return text; // Возвращаем как есть, если не удалось расшифровать (возможно, данные не зашифрованы)
  }
}

module.exports = {
  encrypt,
  decrypt
};
