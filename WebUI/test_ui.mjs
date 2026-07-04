import puppeteer from 'puppeteer-core';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.static(path.join(__dirname, 'dist')));

const server = app.listen(3000, async () => {
  console.log('Server running on port 3000');
  
  const browser = await puppeteer.launch({ executablePath: 'C:\\\\Program Files (x86)\\\\Microsoft\\\\Edge\\\\Application\\\\msedge.exe', headless: true });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log('BROWSER LOG:', msg.text());
  });
  
  page.on('pageerror', err => {
    console.log('PAGE ERROR:', err.toString());
  });

  await page.evaluateOnNewDocument(() => {
    window.addEventListener('error', e => console.log('RUNTIME ERROR:', e.message));
    window.addEventListener('unhandledrejection', e => console.log('PROMISE ERROR:', e.reason));
  });

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0', timeout: 3000 });
  } catch (e) {
    console.log('GOTO TIMEOUT', e.message);
  }
  
  await browser.close();
  server.close();
});
