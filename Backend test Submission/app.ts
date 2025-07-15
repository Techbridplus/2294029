

import express from 'express';
import { Log } from '../Logging Middleware'; 
import { createShortUrl, getShortUrl, incrementClick } from './urlStore';
import { generateShortcode, isValidShortcode, isValidUrl } from './utils';

const app = express();
app.use(express.json());

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnYXVyYXZqb3NoaWFhMUBnbWFpbC5jb20iLCJleHAiOjE3NTI1NTc4MzIsImlhdCI6MTc1MjU1NjkzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImYxMTljMTQxLTcyZDYtNGQ0NC05YzU3LTVkMzMxYWI3ZTU2NSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImdhdXJhdiBqb3NoaSIsInN1YiI6ImViOGU0YTU1LTc5NGItNDJiMy1iNDY0LWIwNmJlMzZjZDY1NCJ9LCJlbWFpbCI6ImdhdXJhdmpvc2hpYWExQGdtYWlsLmNvbSIsIm5hbWUiOiJnYXVyYXYgam9zaGkiLCJyb2xsTm8iOiIyMjk0MDI5IiwiYWNjZXNzQ29kZSI6IlFBaERVciIsImNsaWVudElEIjoiZWI4ZTRhNTUtNzk0Yi00MmIzLWI0NjQtYjA2YmUzNmNkNjU0IiwiY2xpZW50U2VjcmV0IjoiUFFHaGdWcEF4cXd6Ym5WRSJ9.lXnXNP79VmcG-nVvl43OyQOtVaxtxu0FZT1IVSoN98Y'
const HOSTNAME = 'http://localhost:3000'; 

// POST /shorturls
app.post('/shorturls', async (req, res) => {
  const { url, validity, shortcode } = req.body;

  // Validate URL
  if (!url || !isValidUrl(url)) {
    await Log({
      stack: 'backend',
      level: 'error',
      package: 'handler',
      message: 'Invalid or missing URL in request',
      accessToken:token
    });
    return res.status(400).json({ error: 'Invalid or missing URL' });
  }

  // Validate or generate shortcode
  let code = shortcode;
  if (code) {
    if (!isValidShortcode(code)) {
      await Log({
        stack: 'backend',
        level: 'error',
        package: 'handler',
        message: 'Invalid custom shortcode',
        accessToken: token
      });
      return res.status(400).json({ error: 'Invalid custom shortcode' });
    }
    if (getShortUrl(code)) {
      await Log({
        stack: 'backend',
        level: 'error',
        package: 'handler',
        message: 'Shortcode already exists',
        accessToken: token
      });
      return res.status(409).json({ error: 'Shortcode already exists' });
    }
  } else {
    // Generate unique shortcode
    do {
      code = generateShortcode();
    } while (getShortUrl(code));
  }

  // Validity
  const validMinutes = typeof validity === 'number' && validity > 0 ? validity : 30;
  const now = new Date();
  const expiry = new Date(now.getTime() + validMinutes * 60000);

  // Store
  createShortUrl(code, {
    originalUrl: url,
    createdAt: now,
    expiry,
    clicks: [],
  });

  await Log({
    stack: 'backend',
    level: 'info',
    package: 'handler',
    message: `Short URL created: ${code} for ${url}`,
    accessToken:token
  });

  return res.status(201).json({
    shortLink: `${HOSTNAME}/${code}`,
    expiry: expiry.toISOString(),
  });
});

// GET /shorturls/:shortcode (stats)
app.get('/shorturls/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const data = getShortUrl(shortcode);

  if (!data) {
    await Log({
      stack: 'backend',
      level: 'error',
      package: 'handler',
      message: `Shortcode not found: ${shortcode}`,
      accessToken: token
    });
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  // Expiry check
  if (data.expiry < new Date()) {
    await Log({
      stack: 'backend',
      level: 'warn',
      package: 'handler',
      message: `Shortcode expired: ${shortcode}`,
      accessToken:token
    });
    return res.status(410).json({ error: 'Shortcode expired' });
  }

  await Log({
    stack: 'backend',
    level: 'info',
    package: 'handler',
    message: `Stats retrieved for shortcode: ${shortcode}`,
    accessToken:token
  });

  return res.json({
    originalUrl: data.originalUrl,
    createdAt: data.createdAt,
    expiry: data.expiry,
    totalClicks: data.clicks.length,
    clicks: data.clicks,
  });
});

// GET /:shortcode (redirect)
app.get('/:shortcode', async (req, res) => {
  const { shortcode } = req.params;
  const data = getShortUrl(shortcode);

  if (!data) {
    await Log({
      stack: 'backend',
      level: 'error',
      package: 'handler',
      message: `Shortcode not found: ${shortcode}`,
      accessToken:token
    });
    return res.status(404).json({ error: 'Shortcode not found' });
  }

  // Expiry check
  if (data.expiry < new Date()) {
    await Log({
      stack: 'backend',
      level: 'warn',
      package: 'handler',
      message: `Shortcode expired: ${shortcode}`,
      accessToken:token
    });
    return res.status(410).json({ error: 'Shortcode expired' });
  }

  // Log click
  incrementClick(shortcode, req.get('referer') || null, null); // geo: null for now

  await Log({
    stack: 'backend',
    level: 'info',
    package: 'handler',
    message: `Redirected for shortcode: ${shortcode}`,
    accessToken:token
  });

  return res.redirect(data.originalUrl);
});

app.listen(3000, () => {
  console.log('URL Shortener running on port 3000');
});
