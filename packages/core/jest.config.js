/** @type {import('ts-jest').JestConfigWithTsJest} */
const { pathsToModuleNameMapper } = require("ts-jest");
const tsconfig = require("tsconfig");
const dotenv = require("dotenv");

dotenv.config({ path: ".env.test" });

const { config } = tsconfig.loadSync(__dirname, "tsconfig.build.json");

module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  },
  moduleNameMapper: pathsToModuleNameMapper(config.compilerOptions.paths, {
    prefix: "<rootDir>"
  })
};
