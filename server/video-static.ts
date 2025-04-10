import express from 'express';
import path from 'path';
import fs from 'fs';

export const registerVideoRoutes = (app: express.Express) => {
  // Custom handler for MP4 files to ensure correct MIME type
  app.get('*.mp4', (req, res) => {
    const filePath = path.join(process.cwd(), 'public', req.path);
    
    // Check if file exists
    if (fs.existsSync(filePath)) {
      // Set content type for video
      res.setHeader('Content-Type', 'video/mp4');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } else {
      res.status(404).send('Not found');
    }
  });
};