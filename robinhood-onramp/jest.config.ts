import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/libs'],
  testMatch: ['**/tests/**/*.spec.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/libs/robinhood$': '<rootDir>/libs/robinhood/src',
    '^@/libs/robinhood/(.*)$': '<rootDir>/libs/robinhood/src/$1',
    '^@/libs/coinbase$': '<rootDir>/libs/coinbase/src',
    '^@/libs/coinbase/(.*)$': '<rootDir>/libs/coinbase/src/$1',
    '^@/libs/shared$': '<rootDir>/libs/shared/src',
    '^@/libs/shared/(.*)$': '<rootDir>/libs/shared/src/$1',
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'libs/**/src/**/*.ts',
    '!libs/**/src/**/index.ts', // Barrel exports
    '!libs/**/tests/**',
    '!libs/**/src/**/*.controller.ts', // NestJS controllers (not used in POC)
    '!libs/**/src/**/*.module.ts', // NestJS modules (not used in POC)
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/libs/robinhood/tests/setup.ts'],
  // Increase timeout for API calls
  testTimeout: 10000,
}

export default config
