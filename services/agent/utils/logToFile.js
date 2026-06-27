import fs from 'fs';
import path from 'path';

const LOG_FILE = './logs/debug.log';

export const logToFile = (label, content, fileName = LOG_FILE) => {
  const dir = path.dirname(fileName);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const timestamp = new Date().toLocaleString();
  const separator = '='.repeat(30);
  const seen = new WeakSet();
  const contentString = JSON.stringify(content, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) return `[Circular]: ${key}`;
      seen.add(value);
    }
    return value;
  }, 2)
  const entry = `\n${separator} [${timestamp}] ${label} ${separator}\n${contentString}\n`;
  fs.appendFileSync(fileName, entry);
};