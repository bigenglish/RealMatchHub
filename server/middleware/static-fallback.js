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

  // First, try to use our static/index.html which has the green theme
  const staticPath = join(__dirname, '../../static/index.html');
  
  // Then try client/index.html as fallback
  const clientPath = join(__dirname, '../../client/index.html');
  
  // Finally, fall back to public/index.html
  const publicPath = join(__dirname, '../../public/index.html');
  
  // Check for files in order of preference
  if (fs.existsSync(staticPath)) {
    return res.sendFile(staticPath);
  } else if (fs.existsSync(clientPath)) {
    return res.sendFile(clientPath);
  }
  
  // Last fallback option
  res.sendFile(publicPath);
}