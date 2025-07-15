// backend-test-submission/urlStore.ts

export interface ShortUrlData {
  originalUrl: string;
  createdAt: Date;
  expiry: Date;
  clicks: {
    timestamp: Date;
    referrer: string | null;
    geo: string | null; // For demo, can be null or dummy
  }[];
}

const urlMap = new Map<string, ShortUrlData>();

export function createShortUrl(shortcode: string, data: ShortUrlData) {
  urlMap.set(shortcode, data);
}

export function getShortUrl(shortcode: string): ShortUrlData | undefined {
  return urlMap.get(shortcode);
}

export function incrementClick(shortcode: string, referrer: string | null, geo: string | null) {
  const data = urlMap.get(shortcode);
  if (data) {
    data.clicks.push({ timestamp: new Date(), referrer, geo });
  }
}
