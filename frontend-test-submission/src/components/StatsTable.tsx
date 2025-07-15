// src/components/StatsTable.tsx
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableRow, Paper, Typography } from '@mui/material';

interface Click {
  timestamp: string;
  referrer: string | null;
  geo: string | null;
}

interface Stat {
  shortLink: string;
  originalUrl: string;
  createdAt: string;
  expiry: string;
  totalClicks: number;
  clicks: Click[];
}

export default function StatsTable({ stats }: { stats: Stat[] }) {
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>Shortened URL Statistics</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Short Link</TableCell>
            <TableCell>Original URL</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Expiry</TableCell>
            <TableCell>Total Clicks</TableCell>
            <TableCell>Click Details</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {stats.map((stat, idx) => (
            <TableRow key={idx}>
              <TableCell>
                <a href={stat.shortLink} target="_blank" rel="noopener noreferrer">{stat.shortLink}</a>
              </TableCell>
              <TableCell>{stat.originalUrl}</TableCell>
              <TableCell>{new Date(stat.createdAt).toLocaleString()}</TableCell>
              <TableCell>{new Date(stat.expiry).toLocaleString()}</TableCell>
              <TableCell>{stat.totalClicks}</TableCell>
              <TableCell>
                {stat.clicks.map((click, cidx) => (
                  <div key={cidx}>
                    {new Date(click.timestamp).toLocaleString()} | Referrer: {click.referrer || 'N/A'} | Geo: {click.geo || 'N/A'}
                  </div>
                ))}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}