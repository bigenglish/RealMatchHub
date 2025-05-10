#!/bin/bash

# Check if running in production mode
if [ "$NODE_ENV" = "production" ]; then
  echo "Starting server in production mode"
  node dist/server/index.js
else
  echo "Starting static server in development mode"
  node server/static-server.js
fi