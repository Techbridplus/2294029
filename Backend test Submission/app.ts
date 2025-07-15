

import express from 'express';
import { Log } from '../Logging Middleware';
import { createShortUrl, getShortUrl, incrementClick } from './urlStore';
import { generateShortcode, isValidShortcode, isValidUrl ,fetchAccessToken} from './utils';

const config = {
  email: "gauravjoshiaa1@gmail.com",
  name: "Gaurav Joshi",
  rollNo: "2294029",
  accessCode: "QAhDUr",
  clientID: "eb8e4a55-794b-42b3-b464-b06be36cd654",
  clientSecret: "PQGhgVpAxqwzbnVE"
};

const app = express();
app.use(express.json());

const HOSTNAME = 'http://localhost:3001';
let accessToken: string | null = null;

// Fetch the access token once at startup
async function initialize() {
  accessToken = await fetchAccessToken(config);
  if (!accessToken) {
    console.error('Failed to fetch access token. Exiting...');
    process.exit(1);
  }

  app.listen(3001, () => {
    console.log('URL Shortener running on port 3000');
  });
}

initialize();

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
      accessToken: accessToken!
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
        accessToken:accessToken!
      });
      return res.status(400).json({ error: 'Invalid custom shortcode' });
    }
    if (getShortUrl(code)) {
      await Log({
        stack: 'backend',
        level: 'error',
        package: 'handler',
        message: 'Shortcode already exists',
        accessToken:accessToken!
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
    accessToken:accessToken!
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
      accessToken:accessToken!
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
      accessToken:accessToken!
    });
    return res.status(410).json({ error: 'Shortcode expired' });
  }

  await Log({
    stack: 'backend',
    level: 'info',
    package: 'handler',
    message: `Stats retrieved for shortcode: ${shortcode}`,
    accessToken:accessToken!
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
      accessToken:accessToken!
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
      accessToken:accessToken!
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
    accessToken:accessToken!
  });

  return res.redirect(data.originalUrl);
});


