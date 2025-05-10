import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Middleware that serves the static fallback HTML page for routes that
 * aren't API endpoints. This ensures the app always displays something,
 * even when the React app fails to load.
 */
export function staticFallbackMiddleware(req, res, next) {
  // Skip API routes and static assets
  if (req.path.startsWith('/api/') || 
      req.path.startsWith('/auth/') || 
      req.path.startsWith('/static/') ||
      req.path.startsWith('/assets/') ||
      req.path.endsWith('.js') ||
      req.path.endsWith('.css') ||
      req.path.endsWith('.png') ||
      req.path.endsWith('.jpg') ||
      req.path.endsWith('.svg')) {
    return next();
  }

  // Try to use client/index.html first, fall back to public/index.html
  const clientPath = join(__dirname, '../../client/index.html');
  const publicPath = join(__dirname, '../../public/index.html');
  
  // Check if client/index.html exists
  if (fs.existsSync(clientPath)) {
    return res.sendFile(clientPath);
  }
  
  // Fall back to public/index.html
  res.sendFile(publicPath);
}