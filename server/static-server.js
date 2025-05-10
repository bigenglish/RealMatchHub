const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the client directory
app.use(express.static(path.join(__dirname, '../client')));

// API routes for health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Realty.AI static server is running' });
});

// Additional API routes can be added here

// All other routes redirect to index.html for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[static-server] Server running on port ${PORT}`);
});