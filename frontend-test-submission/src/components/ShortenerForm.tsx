// src/components/ShortenerForm.tsx
import React, { useState } from 'react';
import { TextField, Button, Grid, Paper, Typography } from '@mui/material';

type UrlInput = {
  url: string;
  validity: string;
  shortcode: string;
};

interface ShortenerFormProps {
  onSubmit: (inputs: UrlInput[]) => void;
}

export default function ShortenerForm({ onSubmit }: ShortenerFormProps) {
  const [inputs, setInputs] = useState<UrlInput[]>([{ url: '', validity: '', shortcode: '' }]);

  const handleChange = (idx: number, field: keyof UrlInput, value: string) => {
    const newInputs = [...inputs];
    newInputs[idx][field] = value;
    setInputs(newInputs);
  };

  const addInput = () => {
    if (inputs.length < 5) setInputs([...inputs, { url: '', validity: '', shortcode: '' }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(inputs);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>Shorten up to 5 URLs</Typography>
      <form onSubmit={handleSubmit}>
        {inputs.map((input, idx) => (
          <Grid container spacing={2} key={idx} alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={5}>
              <TextField
                label="Long URL"
                value={input.url}
                onChange={e => handleChange(idx, 'url', e.target.value)}
                fullWidth
                required
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Validity (minutes)"
                value={input.validity}
                onChange={e => handleChange(idx, 'validity', e.target.value)}
                type="number"
                fullWidth
              />
            </Grid>
            <Grid item xs={3}>
              <TextField
                label="Custom Shortcode"
                value={input.shortcode}
                onChange={e => handleChange(idx, 'shortcode', e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>
        ))}
        <Button onClick={addInput} disabled={inputs.length >= 5} sx={{ mr: 2 }}>
          Add URL
        </Button>
        <Button type="submit" variant="contained">Shorten</Button>
      </form>
    </Paper>
  );
}