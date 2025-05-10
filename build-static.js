import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define paths
const publicDir = path.join(__dirname, 'public');
const distDir = path.join(__dirname, 'dist/public');

// Create dist directory if it doesn't exist
if (!fs.existsSync(distDir)) {
  console.log(`Creating dist directory at ${distDir}`);
  fs.mkdirSync(distDir, { recursive: true });
}

// Copy all files from public to dist/public
function copyFiles(srcDir, destDir) {
  const files = fs.readdirSync(srcDir);
  
  files.forEach(file => {
    const srcFile = path.join(srcDir, file);
    const destFile = path.join(destDir, file);
    const stats = fs.statSync(srcFile);
    
    if (stats.isFile()) {
      console.log(`Copying ${srcFile} to ${destFile}`);
      fs.copyFileSync(srcFile, destFile);
    } else if (stats.isDirectory()) {
      if (!fs.existsSync(destFile)) {
        fs.mkdirSync(destFile, { recursive: true });
      }
      copyFiles(srcFile, destFile);
    }
  });
}

try {
  copyFiles(publicDir, distDir);
  console.log('Static files copied successfully!');
} catch (error) {
  console.error('Error copying static files:', error);
  process.exit(1);
}