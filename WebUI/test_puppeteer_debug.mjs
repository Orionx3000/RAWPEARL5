import puppeteer from 'puppeteer';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css'
};

const server = http.createServer((req, res) => {
  let p = req.url === '/' ? '/index.html' : req.url;
  p = p.split('?')[0];
  const fullPath = path.join(__dirname, 'dist', p);
  try {
    const ext = path.extname(fullPath);
    const data = fs.readFileSync(fullPath);
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
    res.end(data);
  } catch(e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(3000, async () => {
  console.log('Server running on port 3000');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure().errorText));

  try {
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 5000 });
    console.log('GOTO FINISHED');
  } catch(e) {
    console.log('GOTO TIMEOUT', e.message);
  }
  
  // Wait a bit to let any errors flush
  await new Promise(r => setTimeout(r, 2000));
  
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  console.log('BODY LENGTH:', bodyHTML.length);
  
  await browser.close();
  server.close();
});

