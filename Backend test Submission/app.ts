// backend-test-submission/app.ts

import express from 'express';
import { Log } from '../Logging Middleware'; // Adjust path as needed
import { createShortUrl, getShortUrl, incrementClick } from './urlStore';
import { generateShortcode, isValidShortcode, isValidUrl } from './utils';

const app = express();
app.use(express.json());

const CLIENT_ID = 'eb8e4a55-794b-42b3-b464-b06be36cd654';
const CLIENT_SECRET = 'PQGhgVpAxqwzbnVE';
const token = ' QAhDUr'
const HOSTNAME = 'http://localhost:3000'; // Change as needed

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
