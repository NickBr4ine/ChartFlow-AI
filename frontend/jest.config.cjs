/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  collectCoverageFrom: ["src/**/*.{ts,tsx}", "!src/app/**", "!src/**/*.d.ts"],
  moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json"],
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"]
};

module.exports = config;
