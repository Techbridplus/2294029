// src/components/ShortenerResult.tsx
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

interface Result {
  originalUrl: string;
  shortLink: string;
  expiry: string;
}

export default function ShortenerResult({ results }: { results: Result[] }) {
  return (
    <div>
      {results.map((res, idx) => (
        <Card key={idx} sx={{ my: 2 }}>
          <CardContent>
            <Typography variant="subtitle1">Original: {res.originalUrl}</Typography>
            <Typography variant="h6">
              Short Link: <a href={res.shortLink} target="_blank" rel="noopener noreferrer">{res.shortLink}</a>
            </Typography>
            <Typography variant="body2">Expires: {new Date(res.expiry).toLocaleString()}</Typography>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}