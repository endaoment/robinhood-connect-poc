import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/__tests__'],
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'lib/robinhood/services/**/*.ts', // Focus on core service layer
    '!lib/**/*.d.ts',
    '!lib/**/__test*.ts',
    '!lib/**/index.ts', // Barrel exports
    '!lib/**/types.ts', // Type-only files
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  // Increase timeout for API calls
  testTimeout: 10000,
}

export default config
