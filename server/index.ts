import dotenv from 'dotenv';
dotenv.config(); // Load environment variables from .env file

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { createServer } from 'http'; // Added import statement
import cors from 'cors';
import session from 'express-session';
import { MemoryStore } from 'express-session';

// Check for IDX Broker API key at startup
if (process.env.IDX_BROKER_API_KEY) {
  log("IDX_BROKER_API_KEY found, real IDX integration enabled", "express");
} else {
  log("IDX_BROKER_API_KEY not found, using mock IDX data", "express");
}

const app = express();
// Security middleware
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

// Configure CORS
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://workspace.replit.app'] 
    : '*', // In development, allow all origins
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // If you need to handle cookies across origins
};

app.use(cors(corsOptions));
app.use(helmet()); // Add security headers
app.use('/api/', limiter); // Apply rate limiting to all API routes
app.use(express.json({ limit: '10kb' })); // Limit request size
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// Add cookie parser before CSRF
import cookieParser from 'cookie-parser';
app.use(cookieParser(process.env.SESSION_SECRET || 'your-secret-key'));
app.use(session({
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000 or 3000 as fallback
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  // Using a higher port to avoid conflicts
  const PORT = 5000; // Fixed port for deployment
  server.listen({
      port: PORT,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`Server running on port ${PORT}`);
    });

  // Handle server errors
  server.on('error', (e: any) => {
    if (e.code === 'EADDRINUSE') {
      const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
      console.log(`Port ${PORT} is busy, retrying on port ${portNumber + 1}...`);
      setTimeout(() => {
        server.close();
        server.listen(portNumber + 1, '0.0.0.0');
      }, 1000);
    }
  });

})();