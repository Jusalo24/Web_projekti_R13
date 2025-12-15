/** @type {import('jest').Config} */
export default {
  testEnvironment: "node",
  verbose: true,
  testMatch: ["**/server/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/server/tests/jest.setup.js"],
  // If your project uses ESM (import/export), Jest needs this:
  transform: {},

  // Prevent open handles from hanging test run (DB connections etc.)
  detectOpenHandles: true,
  forceExit: true
}
