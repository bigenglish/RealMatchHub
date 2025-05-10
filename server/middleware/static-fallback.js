import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Middleware that serves the static fallback HTML page for routes that
 * aren't API endpoints. This ensures the app always displays something,
 * even when the React app fails to load.
 */
export function staticFallbackMiddleware(req, res, next) {
  // Skip API routes
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

  // For all other non-asset routes that aren't explicitly handled,
  // serve the public/index.html static page
  const publicPath = join(__dirname, '../../public/index.html');
  res.sendFile(publicPath);
}