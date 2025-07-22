/**
 * Jest configuration for ES modules and TypeScript support in a Vite/React project.
 */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[tj]sx?$': ['babel-jest', { configFile: './babel.config.cjs' }],
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
    '^.+\.(css|scss|sass)$': 'jest-transform-stub',
  },
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx'],
  setupFilesAfterEnv: ['./tests/setup/jest.setup.js'],
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
  moduleNameMapper: {
    '^@/setup/(.*)$': '<rootDir>/tests/setup/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1',
    '\.(css|less|scss|sass)$': 'identity-obj-proxy',
  },
  transformIgnorePatterns: [
    '/node_modules/(?!react-markdown|remark-gfm|remark-parse|remark-rehype|rehype-raw|rehype-sanitize|hast-util-whitespace|hast-util-to-jsx-runtime|micromark|mdast-util-to-string|unist-util-visit|vfile|is-plain-obj|trough|devlop|property-information|space-separated-tokens|comma-separated-tokens|zwitch|bail|is-buffer|is-plain-object|is-regexp|is-string|is-symbol|isarray|traverse|traverse-children|traverse-parents|traverse-siblings)/',
    '<rootDir>/dist/',
  ],
  setupFiles: [
    './tests/setup/polyfills.js',
  ],
  globals: {
    'ts-jest': {
      babelConfig: true,
      useESM: true,
    },
  },
  extensionsToTreatAsEsm: ['.jsx', '.ts', '.tsx'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}'],
  verbose: true,
};
