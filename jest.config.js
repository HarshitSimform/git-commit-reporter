module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src", "<rootDir>/tests"],
  testMatch: ["**/__tests__/**/*.ts", "**/?(*.)+(spec|test).ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!(@octokit)/)"],
  moduleNameMapper: {
    "^@octokit/rest$": "<rootDir>/tests/__mocks__/@octokit/rest.js",
  },
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts"],
};
