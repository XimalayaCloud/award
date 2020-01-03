module.exports = {
  testRegex: './__tests__/.*.spec.tsx?',
  collectCoverageFrom: [
    'packages/{award,award-fetch,award-router,award-utils}/src/**/*.{ts,tsx}', // client
    'packages/{award-plugin,award-render,award-server}/src/**/*.{ts,tsx}', // server
    'packages/award-scripts/src/**/*.{ts,tsx}' // 工具包
  ],
  coverageDirectory: './coverage/',
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  testPathIgnorePatterns: ['__snapshots__', 'node_modules', 'tools', 'dist'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    'award-plugin-demo': '<rootDir>/common.d.ts',
    '(.*)award.config.js': '$1award.config.js',
    '(.*)\\.award(.*)': '$1.award$2',
    '^@/fixtures(.*)': '<rootDir>/fixtures$1', // 针对@/fixtures
    '(.*)fixtures(.*)': '$1fixtures$2', // root/fixtures/项目
    'award/package.json': '<rootDir>/packages/award/package.json',
    'award-scripts/package.json': '<rootDir>/packages/award-scripts/package.json',
    'award/server': '<rootDir>/packages/award/server.js',
    'award-scripts/prepare': '<rootDir>/packages/award-scripts/prepare.js',
    'award-scripts/src/tools/babel/babel-config':
      '<rootDir>/packages/award-scripts/src/tools/babel/babel-config',
    'award-(.*)/(.*)': '<rootDir>/packages/award-$1/src/$2',
    'award-(.*)': '<rootDir>/packages/award-$1/src',
    award: '<rootDir>/packages/award/src'
  }
};
