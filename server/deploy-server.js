import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the public directory
app.use(express.static(join(__dirname, '../public')));

// API routes for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Realty.AI static server is running' });
});

// All other routes redirect to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, '../public/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[deploy-server] Server running on http://0.0.0.0:${PORT}`);
});