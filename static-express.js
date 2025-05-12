// Static server that serves the built React app
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5001;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// For any other route, serve the index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Static express server running at http://0.0.0.0:${PORT}`);
});