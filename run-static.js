import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

// Serve the static HTML files directly
app.use(express.static(__dirname));
app.use(express.static(join(__dirname, 'public')));

// For all routes, first try to send the requested file
app.get('*', (req, res) => {
  // First try to serve the file directly from the root directory
  const rootPath = join(__dirname, req.path);
  if (fs.existsSync(rootPath) && fs.statSync(rootPath).isFile()) {
    return res.sendFile(rootPath);
  }
  
  // Then try from the public directory
  const publicPath = join(__dirname, 'public', req.path);
  if (fs.existsSync(publicPath) && fs.statSync(publicPath).isFile()) {
    return res.sendFile(publicPath);
  }
  
  // Default to the index.html in root directory
  return res.sendFile(join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server running at http://0.0.0.0:${PORT}`);
});