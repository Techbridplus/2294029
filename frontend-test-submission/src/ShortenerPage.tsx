import React, { useState } from 'react';
import ShortenerForm from './components/ShortenerForm';
import ShortenerResult from './components/ShortenerResult';
import { Log } from '../../Logging Middleware/index';

export default function ShortenerPage() {
  const [results, setResults] = useState<any[]>([]);

  const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJnYXVyYXZqb3NoaWFhMUBnbWFpbC5jb20iLCJleHAiOjE3NTI1NTc4MzIsImlhdCI6MTc1MjU1NjkzMiwiaXNzIjoiQWZmb3JkIE1lZGljYWwgVGVjaG5vbG9naWVzIFByaXZhdGUgTGltaXRlZCIsImp0aSI6ImYxMTljMTQxLTcyZDYtNGQ0NC05YzU3LTVkMzMxYWI3ZTU2NSIsImxvY2FsZSI6ImVuLUlOIiwibmFtZSI6ImdhdXJhdiBqb3NoaSIsInN1YiI6ImViOGU0YTU1LTc5NGItNDJiMy1iNDY0LWIwNmJlMzZjZDY1NCJ9LCJlbWFpbCI6ImdhdXJhdmpvc2hpYWExQGdtYWlsLmNvbSIsIm5hbWUiOiJnYXVyYXYgam9zaGkiLCJyb2xsTm8iOiIyMjk0MDI5IiwiYWNjZXNzQ29kZSI6IlFBaERVciIsImNsaWVudElEIjoiZWI4ZTRhNTUtNzk0Yi00MmIzLWI0NjQtYjA2YmUzNmNkNjU0IiwiY2xpZW50U2VjcmV0IjoiUFFHaGdWcEF4cXd6Ym5WRSJ9.lXnXNP79VmcG-nVvl43OyQOtVaxtxu0FZT1IVSoN98Y';

  const handleSubmit = async (inputs: any[]) => {
    const newResults = [];
    for (const input of inputs) {
      // Client-side validation
      if (!input.url || !/^https?:\/\/.+\..+/.test(input.url)) {
        await Log({
          stack: 'frontend',
          level: 'error',
          package: 'component',
          message: `Invalid URL: ${input.url}`,
          accessToken,
        });
        continue;
      }
      // Prepare request body
      const body: any = { url: input.url };
      if (input.validity) body.validity = parseInt(input.validity, 10);
      if (input.shortcode) body.shortcode = input.shortcode;
  
      try {
        const res = await fetch('http://localhost:3000/shorturls', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (res.ok) {
          newResults.push({ ...data, originalUrl: input.url });
          await Log({
            stack: 'frontend',
            level: 'info',
            package: 'component',
            message: `Shortened URL: ${input.url} -> ${data.shortLink}`,
            accessToken,
          });
        } else {
          await Log({
            stack: 'frontend',
            level: 'error',
            package: 'component',
            message: `Failed to shorten URL: ${input.url} (${data.error})`,
            accessToken,
          });
        }
      } catch (err) {
        await Log({
          stack: 'frontend',
          level: 'fatal',
          package: 'component',
          message: `Network error for URL: ${input.url}`,
          accessToken,
        });
      }
    }
    setResults(newResults);
  };

  return (
    <div>
      <ShortenerForm onSubmit={handleSubmit} />
      <ShortenerResult results={results} />
    </div>
  );
}