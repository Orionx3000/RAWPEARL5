import jsdom from 'jsdom';
const { JSDOM, VirtualConsole } = jsdom;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.join(__dirname, 'dist', 'index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const virtualConsole = new VirtualConsole();
virtualConsole.on('error', (err) => {
  console.error('JSDOM ERROR:', err);
});
virtualConsole.on('jsdomError', (err) => {
  console.error('JSDOM INTERNAL ERROR:', err);
});
virtualConsole.on('log', (msg) => {
  console.log('JSDOM LOG:', msg);
});

const dom = new JSDOM(html, {
  url: 'http://localhost/',
  runScripts: 'dangerously',
  virtualConsole
});

// Mock cancelAnimationFrame
dom.window.cancelAnimationFrame = () => {};
dom.window.requestAnimationFrame = (cb) => setTimeout(cb, 16);

const bundleName = fs.readdirSync(path.join(__dirname, 'dist', 'assets')).find(f => f.startsWith('index-') && f.endsWith('.js'));
const bundleCode = fs.readFileSync(path.join(__dirname, 'dist', 'assets', bundleName), 'utf8');

const scriptEl = dom.window.document.createElement('script');
scriptEl.textContent = bundleCode;
dom.window.document.body.appendChild(scriptEl);

setTimeout(() => {
  const rootEl = dom.window.document.getElementById('root');
  console.log('ROOT HTML:', rootEl ? rootEl.innerHTML : 'NULL');
  process.exit(0);
}, 2000);

