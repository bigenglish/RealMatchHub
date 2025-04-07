#!/bin/bash

# Find and use Node.js from Nix store
PATH=$(find /nix/store -type f -name node -path "*/nodejs-20*/bin/node" | head -n 1 | xargs dirname):$PATH
export PATH

# Debug info
echo "PATH=$PATH"
echo "Node version: $(node --version 2>/dev/null || echo 'Not found')"
echo "NPM version: $(npm --version 2>/dev/null || echo 'Not found')"

# Check and install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the application
echo "Starting application..."
npm run dev