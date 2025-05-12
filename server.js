// Simple Express server that serves the React app along with a fallback to static HTML
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// First, try to serve static files from client/dist if it exists (production build)
if (fs.existsSync(path.join(__dirname, 'client', 'dist'))) {
  app.use(express.static(path.join(__dirname, 'client', 'dist')));
} 

// Then, try to serve files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the client/index.html as a fallback for client-side routes
app.get('/client*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// For API routes
app.get('/api/hello', (req, res) => {
  res.json({ message: "Hello from the API!" });
});

// For any other route, fall back to the static HTML in public directory
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  
  // Try to serve the HTML file from public directory
  const filePath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(filePath)) {
    return res.sendFile(filePath);
  }
  
  // If public/index.html doesn't exist, serve client/index.html as a last resort
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});