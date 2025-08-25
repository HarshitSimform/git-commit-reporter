import { config as dotenvConfig } from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenvConfig({ path: path.resolve(process.cwd(), '.env') });

export interface Config {
  openai: {
    apiKey: string | undefined;
  };
  huggingface: {
    token: string | undefined;
  };
  github: {
    token: string | undefined;
  };
  app: {
    nodeEnv: string;
    logLevel: string;
  };
}

/**
 * Centralized configuration object that gathers all environment variables
 * and makes them available throughout the application
 */
export const config: Config = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  huggingface: {
    token: process.env.HUGGINGFACE_TOKEN,
  },
  github: {
    token: process.env.GITHUB_TOKEN,
  },
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    logLevel: process.env.LOG_LEVEL || 'info',
  },
};

/**
 * Validates that required environment variables are present
 * @param required - Array of configuration paths that are required
 */
export function validateConfig(required: string[] = []): void {
  const missing: string[] = [];

  for (const path of required) {
    const keys = path.split('.');
    let current: any = config;

    for (const key of keys) {
      current = current[key];
      if (current === undefined) {
        missing.push(path);
        break;
      }
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(', ')}`);
  }
}

/**
 * Get a configuration value with optional default
 * @param path - Dot notation path to the config value
 * @param defaultValue - Default value if not found
 */
export function getConfig<T = any>(path: string, defaultValue?: T): T {
  const keys = path.split('.');
  let current: any = config;

  for (const key of keys) {
    current = current[key];
    if (current === undefined) {
      return defaultValue as T;
    }
  }

  return current as T;
}

/**
 * Check if a configuration value exists
 * @param path - Dot notation path to the config value
 */
export function hasConfig(path: string): boolean {
  const keys = path.split('.');
  let current: any = config;

  for (const key of keys) {
    current = current[key];
    if (current === undefined) {
      return false;
    }
  }

  return true;
}

export default config;
