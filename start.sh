#!/bin/bash

# Find Node.js binary
NODEJS_BIN="/mnt/nixmodules/nix/store/nmmgwk1a0cakhmhwgf1v2b5ws3zf899h-nodejs-18.20.5/bin/node"

# Check if Node.js is available in that path
if [ ! -f "$NODEJS_BIN" ]; then
  echo "Node.js not found at expected path"
  # Try to find node in nix store
  NODEJS_BIN=$(find /mnt/nixmodules/nix/store -name node -type f | grep bin/node | head -n 1)
  
  if [ -z "$NODEJS_BIN" ]; then
    echo "Node.js not found in Nix store"
    exit 1
  else
    echo "Found Node.js at $NODEJS_BIN"
  fi
fi

# Set PATH to include the directory with Node.js
export PATH="$(dirname $NODEJS_BIN):$PATH"

# Check Node.js version
echo "Using Node.js:"
node --version

# Run the application
echo "Starting application..."
export NODE_ENV=development
node_modules/.bin/tsx server/index.ts