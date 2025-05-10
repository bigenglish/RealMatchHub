import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const PORT = process.env.STATIC_PORT || 5001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, '../public')));

// Fallback to index.html for any other route
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../public/index.html');
  
  // Check if index.html exists
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // If index.html doesn't exist, send a basic HTML response
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Realty.AI</title>
          <style>
            body { font-family: sans-serif; margin: 40px; text-align: center; }
            h1 { color: #2c5e2e; }
          </style>
        </head>
        <body>
          <h1>Realty.AI</h1>
          <p>The Future of Real Estate is Here.</p>
          <p>Our application is currently loading. Please check back in a moment.</p>
        </body>
      </html>
    `);
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static server is running at http://0.0.0.0:${PORT}`);
});