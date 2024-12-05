/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["<rootDir>/test/node/*.test.ts"],
  extensionsToTreatAsEsm: [".ts"],
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
        tsconfig: "./tsconfig.test.json"
      }
    ]
  }
};
