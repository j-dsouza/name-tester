import { createHash } from 'crypto';

const BASE62_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

export function generateShortlink(data: any): string {
  // Create a hash of the data to ensure uniqueness
  const dataString = JSON.stringify(data);
  const hash = createHash('sha256').update(dataString + Date.now().toString()).digest();
  
  // Convert hash to Base62 and take first 16 characters
  let result = '';
  let num = BigInt('0x' + hash.toString('hex').substring(0, 16));
  const zero = BigInt(0);
  const sixtytwo = BigInt(62);
  
  while (num > zero && result.length < 16) {
    result = BASE62_CHARS[Number(num % sixtytwo)] + result;
    num = num / sixtytwo;
  }
  
  // Ensure we always have 16 characters by padding with random chars if needed
  while (result.length < 16) {
    result = BASE62_CHARS[Math.floor(Math.random() * 62)] + result;
  }
  
  return result.substring(0, 16);
}

export function validateShortlink(shortlink: string): boolean {
  if (shortlink.length !== 16) return false;
  return /^[0-9A-Za-z]{16}$/.test(shortlink);
}