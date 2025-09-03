/**
 * Jest configuration for ES modules and TypeScript support in a Vite/React project.
 */
module.exports = {
  verbose: true,
  projects: [
    // Client (browser/jsdom)
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.js'],
      setupFiles: ['<rootDir>/tests/setup/polyfills.js'],
      transform: {
        '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.tsx$': 'ts-jest',
        '^.+\\.(css|scss|sass)$': 'jest-transform-stub',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!react-markdown|remark-gfm|remark-parse|remark-rehype|rehype-raw|rehype-sanitize|hast-util-whitespace|hast-util-to-jsx-runtime|micromark|mdast-util-to-string|unist-util-visit|vfile|is-plain-obj|trough|devlop|property-information|space-separated-tokens|comma-separated-tokens|zwitch|bail|is-buffer|is-plain-object|is-regexp|is-string|is-symbol|isarray|traverse|traverse-children|traverse-parents|traverse-siblings)/',
        '<rootDir>/dist/',
      ],
      moduleNameMapper: {
        '^@/setup/(.*)$': '<rootDir>/tests/setup/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^formidable$': '<rootDir>/tests/setup/mocks/formidable.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
      testMatch: ['<rootDir>/tests/unit/**/*.test.{js,jsx,ts,tsx}', '<rootDir>/tests/integration/**/*.test.{js,jsx,ts,tsx}'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/e2e/', '<rootDir>/tests/unit/server/'],
      collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
    },
    // Server (node)
    {
      displayName: 'server',
      testEnvironment: 'node',
      setupFiles: ['<rootDir>/tests/setup/polyfills.js'],
      transform: {
        '^.+\\.[jt]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
        '^.+\\.ts$': 'ts-jest',
        '^.+\\.tsx$': 'ts-jest',
        '^.+\\.(css|scss|sass)$': 'jest-transform-stub',
      },
      transformIgnorePatterns: [
        '/node_modules/(?!react-markdown|remark-gfm|remark-parse|remark-rehype|rehype-raw|rehype-sanitize|hast-util-whitespace|hast-util-to-jsx-runtime|micromark|mdast-util-to-string|unist-util-visit|vfile|is-plain-obj|trough|devlop|property-information|space-separated-tokens|comma-separated-tokens|zwitch|bail|is-buffer|is-plain-object|is-regexp|is-string|is-symbol|isarray|traverse|traverse-children|traverse-parents|traverse-siblings)/',
        '<rootDir>/dist/',
      ],
      moduleNameMapper: {
        '^@/setup/(.*)$': '<rootDir>/tests/setup/$1',
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@components/(.*)$': '<rootDir>/src/components/$1',
        '^@lib/(.*)$': '<rootDir>/src/lib/$1',
        '^formidable$': '<rootDir>/tests/setup/mocks/formidable.js',
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
      },
      extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
      moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
      testMatch: ['<rootDir>/tests/unit/server/**/*.test.{js,jsx}'],
      testPathIgnorePatterns: ['/node_modules/', '/dist/', '/tests/e2e/'],
    },
  ],
};
