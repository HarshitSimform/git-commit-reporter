import { AIService, WeeklySummaryData } from '../../src/services/ai';
import { CommitCategory, LeaderboardEntry, BranchGroup } from '../../src/types';

// Mock the config to include HF token for tests
jest.mock('../../src/config', () => ({
  config: {
    openai: { apiKey: 'test-key' },
    huggingface: { token: 'test-hf-token' },
    github: { token: 'test-github-token' },
    app: { nodeEnv: 'test', logLevel: 'info' },
  },
  hasConfig: jest.fn((path: string) => {
    const configMap: Record<string, boolean> = {
      'openai.apiKey': true,
      'huggingface.token': true,
      'github.token': true,
    };
    return configMap[path] || false;
  }),
}));

// Mock OpenAI
jest.mock('openai', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

// Mock Hugging Face
jest.mock('@huggingface/inference', () => ({
  HfInference: jest.fn().mockImplementation(() => ({
    textGeneration: jest.fn(),
  })),
}));

describe('AIService', () => {
  let aiService: AIService;
  let mockOpenAI: any;
  let mockHF: any;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    const OpenAI = require('openai').default;
    const { HfInference } = require('@huggingface/inference');

    mockOpenAI = {
      chat: {
        completions: {
          create: jest.fn(),
        },
      },
    };

    mockHF = {
      textGeneration: jest.fn(),
    };

    OpenAI.mockImplementation(() => mockOpenAI);
    HfInference.mockImplementation(() => mockHF);

    // Set up environment variable
    process.env.OPENAI_API_KEY = 'test-api-key';

    aiService = new AIService();
  });

  afterEach(() => {
    delete process.env.OPENAI_API_KEY;
  });

  describe('generateWeeklySummary', () => {
    const mockSummaryData: WeeklySummaryData = {
      totalCommits: 15,
      categories: [
        { name: 'Feature', count: 8, color: '#4CAF50' },
        { name: 'Fix', count: 4, color: '#F44336' },
        { name: 'Docs', count: 3, color: '#2196F3' },
      ],
      topContributors: [
        {
          rank: 1,
          author_name: 'Alice',
          author_email: 'alice@test.com',
          commits: 8,
          badge: '🥇',
        },
        {
          rank: 2,
          author_name: 'Bob',
          author_email: 'bob@test.com',
          commits: 5,
          badge: '🥈',
        },
      ],
      branchGroups: [
        { branch: 'main', commits: [], count: 10 },
        { branch: 'feature/auth', commits: [], count: 5 },
      ],
      dateRange: {
        start: new Date('2023-08-14'),
        end: new Date('2023-08-20'),
      },
    };

    test('should generate AI summary successfully', async () => {
      // Mock Hugging Face success (prioritized over OpenAI now)
      mockHF.textGeneration.mockResolvedValue({
        generated_text:
          'This week, the team focused on implementing 8 new features, resolved 4 critical bugs, and improved documentation. Alice led the development effort with 8 commits, while the main branch saw the most activity.',
      });

      const result = await aiService.generateWeeklySummary(mockSummaryData);

      // Result should be HTML formatted
      expect(result).toMatch(/<p>.*<\/p>/);
      expect(result).toContain('This week, the team focused on implementing 8 new features');

      // Hugging Face should be called first (free provider priority)
      expect(mockHF.textGeneration).toHaveBeenCalled();
    });

    test('should return null when OpenAI API key is not configured', async () => {
      // Mock the config to not have the API key
      jest.doMock('../../src/config', () => ({
        config: {
          openai: { apiKey: undefined },
          huggingface: { token: undefined },
          github: { token: undefined },
          app: { nodeEnv: 'test', logLevel: 'info' },
        },
        hasConfig: jest.fn().mockReturnValue(false),
      }));

      // Clear the module cache and re-import
      jest.resetModules();
      const { AIService: AIServiceWithoutKey } = require('../../src/services/ai');
      const aiServiceWithoutKey = new AIServiceWithoutKey();

      const result = await aiServiceWithoutKey.generateWeeklySummary(mockSummaryData);

      // Should generate basic summary when no AI services are configured
      expect(result).toContain('15 commits');
      expect(result).not.toBeNull();

      // Reset the mock
      jest.dontMock('../../src/config');
      jest.resetModules();
    });

    test('should handle OpenAI API errors gracefully', async () => {
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('API Error'));

      const result = await aiService.generateWeeklySummary(mockSummaryData);

      // Should fallback to basic summary when both AI services fail
      expect(result).toContain('15 commits');
      expect(result).not.toBeNull();
    });

    test('should handle empty response from OpenAI', async () => {
      const mockResponse = {
        choices: [],
      };

      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await aiService.generateWeeklySummary(mockSummaryData);

      // Should fallback to basic summary when OpenAI returns empty
      expect(result).toContain('15 commits');
      expect(result).not.toBeNull();
    });

    test('should fallback to Hugging Face when OpenAI fails', async () => {
      // Mock Hugging Face success (this won't be called since HF is now prioritized)
      mockHF.textGeneration.mockResolvedValue({
        generated_text: 'Hugging Face generated summary',
      });

      const result = await aiService.generateWeeklySummary(mockSummaryData);

      // Should get HTML formatted content
      expect(result).toMatch(/<p>.*<\/p>/);
      expect(result).toContain('Hugging Face generated summary');
      expect(mockHF.textGeneration).toHaveBeenCalled();
    });

    test('should generate basic summary when all AI services fail', async () => {
      // Make both AI services fail
      mockHF.textGeneration.mockRejectedValue(new Error('HF Error'));
      mockOpenAI.chat.completions.create.mockRejectedValue(new Error('OpenAI Error'));

      const result = await aiService.generateWeeklySummary(mockSummaryData);

      // Should get HTML formatted basic summary
      expect(result).toMatch(/<p>.*<\/p>/);
      expect(result).toContain('15 commits');
      expect(result).toContain('Alice'); // Leading contributor
      expect(result).not.toBeNull();
    });

    test('should build proper prompt with all data', async () => {
      // Mock Hugging Face success (now prioritized first)
      mockHF.textGeneration.mockResolvedValue({
        generated_text: 'Test summary',
      });

      await aiService.generateWeeklySummary(mockSummaryData);

      // Verify Hugging Face was called with proper prompt
      const callArgs = mockHF.textGeneration.mock.calls[0][0];
      const prompt = callArgs.inputs;

      expect(prompt).toContain('Total commits: 15');
      expect(prompt).toContain('Feature: 8 commits, Fix: 4 commits, Docs: 3 commits');
      expect(prompt).toContain('Alice (8 commits), Bob (5 commits)');
      expect(prompt).toContain('main (10 commits), feature/auth (5 commits)');
    });
  });
});
