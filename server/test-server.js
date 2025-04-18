const http = require('http');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!');
});

// Listen on a port
const port = 12345;
server.listen(port, '0.0.0.0', () => {
  console.log(`Test server running on port ${port}`);
});