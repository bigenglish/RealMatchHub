#!/bin/bash

# First, make sure the public directory has our static content
echo "Ensuring static HTML is in place..."
cp -f client/index.html public/index.html || echo "Warning: Failed to copy client/index.html to public/"

# Run the regular build process
echo "Running the build process..."
npm run build

# Copy static files to the dist directory
echo "Copying static files to distribution..."
node build-static.js

echo "Build and static files preparation complete!"