import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the public directory
app.use(express.static(join(__dirname, 'public')));

// Handle all routes by serving the index.html file
app.get('*', (req, res) => {
  // Check if the requested path exists in the public directory
  const filePath = join(__dirname, 'public', req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    res.sendFile(filePath);
  } else {
    // Default to index.html for any path that doesn't match a file
    res.sendFile(join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});