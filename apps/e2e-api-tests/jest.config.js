/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  // Allow import with .js extension
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  // Transform .ts files to .js
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "./tsconfig.json"
      }
    ]
  }
};
