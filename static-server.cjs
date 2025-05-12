const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes by serving the index.html file or requested page
app.get('*', (req, res) => {
  // Check if the requested path exists in the public directory
  const filePath = path.join(__dirname, 'public', req.path);
  
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    return res.sendFile(filePath);
  } else {
    // Default to index.html for any path that doesn't match a file
    return res.sendFile(path.join(__dirname, 'public', 'index.html'));
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://0.0.0.0:${PORT}`);
});