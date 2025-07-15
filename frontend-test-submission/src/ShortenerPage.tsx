import React, { useState } from 'react';
import ShortenerForm from './components/ShortenerForm';
import ShortenerResult from './components/ShortenerResult';

export default function ShortenerPage() {
  const [results, setResults] = useState<any[]>([]);

  const handleSubmit = async (inputs: any[]) => {
    // Call backend for each input, collect results, and setResults
    // Use your logging middleware for each API call and error
  };

  return (
    <div>
      <ShortenerForm onSubmit={handleSubmit} />
      <ShortenerResult results={results} />
    </div>
  );
}