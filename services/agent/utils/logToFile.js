
const LOG_FILE = './debug.log';

export const logToFile = (label, content, fileName = LOG_FILE) => {
  const timestamp = new Date().toLocaleString();
  const separator = '='.repeat(30);
  const entry = `\n${separator} [${timestamp}] ${label} ${separator}\n${content}\n`;
  fs.appendFileSync(fileName, entry);
};