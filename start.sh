#!/bin/bash

# This script handles the proper startup for deployment
echo "Starting deployment process..."

# Run the build process
npm run build

# Start the server with the correct path
NODE_ENV=production node dist/server/index.js