import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.post('/log-error', (req, res) => {
  console.error('BROWSER ERROR CAUGHT:', req.body);
  res.send('ok');
});

const distPath = path.join(__dirname, 'dist');
let indexHtml = fs.readFileSync(path.join(distPath, 'index.html'), 'utf8');
const scriptTag = \<script>
  window.addEventListener('error', function(event) {
    fetch('/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: event.message, filename: event.filename, lineno: event.lineno, colno: event.colno, error: event.error ? event.error.stack : null })
    });
  });
  window.addEventListener('unhandledrejection', function(event) {
    fetch('/log-error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: event.reason ? event.reason.stack || event.reason.toString() : 'Unhandled Rejection' })
    });
  });
</script>\;
indexHtml = indexHtml.replace('</head>', scriptTag + '</head>');

app.get('/', (req, res) => {
  res.send(indexHtml);
});

app.use(express.static(distPath));

app.listen(3000, () => {
  console.log('Test server running at http://localhost:3000');
  console.log('Please open this URL in your browser, or I will use puppeteer if available.');
});
