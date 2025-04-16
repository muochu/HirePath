import { Request, Response, NextFunction } from 'express';
import path from 'path';
import express from 'express';

// List of paths that should be publicly accessible
const PUBLIC_PATHS = [
  '/manifest.json',
  '/favicon.ico',
  '/logo.svg',
  '/static',
  '/assets',
  '/*.js',
  '/*.css',
  '/*.png',
  '/*.jpg',
  '/*.jpeg',
  '/*.gif',
  '/*.ico',
  '/*.json'
];

// Configure static file serving with caching headers
const staticOptions = {
  maxAge: '1y',
  etag: true,
  lastModified: true,
  setHeaders: (res: Response, path: string) => {
    // Set different cache control for manifest and icons
    if (path.endsWith('manifest.json') || path.endsWith('.ico') || path.endsWith('.svg')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
};

export const serveStatic = express.static(path.join(__dirname, '../../public'), staticOptions);

export const isPublicPath = (req: Request, res: Response, next: NextFunction) => {
  const reqPath = req.path;
  
  // Check if the path matches any of our public paths patterns
  const isPublic = PUBLIC_PATHS.some(pattern => {
    if (pattern.includes('*')) {
      const regex = new RegExp(pattern.replace('*', '.*'));
      return regex.test(reqPath);
    }
    return reqPath.startsWith(pattern);
  });

  if (isPublic) {
    return serveStatic(req, res, next);
  }
  
  next();
}; 