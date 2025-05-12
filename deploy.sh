#!/bin/bash

# Display deployment status
echo "Starting deployment process..."

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed. Aborting deployment."
  exit 1
fi

echo "Build successful. Starting production server..."

# Start the production server
NODE_ENV=production node dist/index.js