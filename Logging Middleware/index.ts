type Stack = 'backend' | 'frontend';
type Level = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
type BackendPackage =
  | 'cache'
  | 'controller'
  | 'cron_job'
  | 'db'
  | 'domain'
  | 'handler'
  | 'repository'
  | 'route'
  | 'service';
type FrontendPackage =
  | 'api'
  | 'component'
  | 'hook'
  | 'page'
  | 'state'
  | 'style';
type CommonPackage = 'auth' | 'config' | 'middleware' | 'utils';

type LogPackage = BackendPackage | FrontendPackage | CommonPackage;

interface LogOptions {
  stack: Stack;
  level: Level;
  package: LogPackage;
  message: string;
  accessToken:string;

}

const LOG_URL = 'http://20.244.56.144/evaluation-service/logs';

export async function Log({
  stack,
  level,
  package: pkg,
  message,
  accessToken

}: LogOptions) {
  try {

    const response = await fetch(LOG_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        stack,
        level,
        package: pkg,
        message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to log:', errorText);
    } else {
      const data = await response.json();

      return data;
    }
  } catch (err) {
    console.error('Error sending log:', err);
  }
}

