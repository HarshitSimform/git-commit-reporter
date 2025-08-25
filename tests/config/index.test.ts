import { config, validateConfig, getConfig, hasConfig } from '../../src/config';

// Mock dotenv
jest.mock('dotenv', () => ({
  config: jest.fn(),
}));

describe('Config Service', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('config object', () => {
    it('should load environment variables correctly', () => {
      process.env.OPENAI_API_KEY = 'test-openai-key';
      process.env.GITHUB_TOKEN = 'test-github-token';
      process.env.NODE_ENV = 'test';
      process.env.LOG_LEVEL = 'debug';

      // Re-import to get updated config
      const { config: freshConfig } = require('../../src/config');

      expect(freshConfig.openai.apiKey).toBe('test-openai-key');
      expect(freshConfig.github.token).toBe('test-github-token');
      expect(freshConfig.app.nodeEnv).toBe('test');
      expect(freshConfig.app.logLevel).toBe('debug');
    });

    it('should use default values when env vars are missing', () => {
      delete process.env.NODE_ENV;
      delete process.env.LOG_LEVEL;

      const { config: freshConfig } = require('../../src/config');

      expect(freshConfig.app.nodeEnv).toBe('development');
      expect(freshConfig.app.logLevel).toBe('info');
    });
  });

  describe('validateConfig', () => {
    it('should pass validation when all required configs are present', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { validateConfig: freshValidateConfig } = require('../../src/config');

      expect(() => {
        freshValidateConfig(['openai.apiKey']);
      }).not.toThrow();
    });

    it('should throw error when required configs are missing', () => {
      delete process.env.OPENAI_API_KEY;
      const { validateConfig: freshValidateConfig } = require('../../src/config');

      expect(() => {
        freshValidateConfig(['openai.apiKey']);
      }).toThrow('Missing required configuration: openai.apiKey');
    });

    it('should validate multiple required configs', () => {
      delete process.env.OPENAI_API_KEY;
      delete process.env.GITHUB_TOKEN;
      const { validateConfig: freshValidateConfig } = require('../../src/config');

      expect(() => {
        freshValidateConfig(['openai.apiKey', 'github.token']);
      }).toThrow('Missing required configuration: openai.apiKey, github.token');
    });
  });

  describe('getConfig', () => {
    it('should return config value when present', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { getConfig: freshGetConfig } = require('../../src/config');

      expect(freshGetConfig('openai.apiKey')).toBe('test-key');
    });

    it('should return default value when config is missing', () => {
      delete process.env.OPENAI_API_KEY;
      const { getConfig: freshGetConfig } = require('../../src/config');

      expect(freshGetConfig('openai.apiKey', 'default-key')).toBe('default-key');
    });

    it('should return undefined when config is missing and no default provided', () => {
      delete process.env.OPENAI_API_KEY;
      const { getConfig: freshGetConfig } = require('../../src/config');

      expect(freshGetConfig('openai.apiKey')).toBeUndefined();
    });
  });

  describe('hasConfig', () => {
    it('should return true when config exists', () => {
      process.env.OPENAI_API_KEY = 'test-key';
      const { hasConfig: freshHasConfig } = require('../../src/config');

      expect(freshHasConfig('openai.apiKey')).toBe(true);
    });

    it('should return false when config is missing', () => {
      delete process.env.OPENAI_API_KEY;
      const { hasConfig: freshHasConfig } = require('../../src/config');

      expect(freshHasConfig('openai.apiKey')).toBe(false);
    });

    it('should handle nested paths correctly', () => {
      process.env.NODE_ENV = 'test';
      const { hasConfig: freshHasConfig } = require('../../src/config');

      expect(freshHasConfig('app.nodeEnv')).toBe(true);
      expect(freshHasConfig('app.nonexistent')).toBe(false);
    });
  });
});
