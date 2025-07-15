// backend-test-submission/utils.ts

export function generateShortcode(length = 6): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function isValidShortcode(code: string): boolean {
  return /^[a-zA-Z0-9]{4,16}$/.test(code); // Alphanumeric, 4-16 chars
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
export async function fetchAccessToken({
  email,
  name,
  rollNo,
  accessCode,
  clientID,
  clientSecret,
}: {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}): Promise<string | null> {
  try {
    const response = await fetch('http://20.244.56.144/evaluation-service/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        rollNo,
        accessCode,
        clientID,
        clientSecret,
      }),
    });
    if (!response.ok) {
      console.error('Failed to fetch access token:', await response.text());
      return null;
    }
    const data = await response.json();
    // Assuming the token is in data.accessToken
    return data.access_token;
  } catch (err) {
    console.error('Error fetching access token:', err);
    return null;
  }
}
