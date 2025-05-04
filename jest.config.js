module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
      '^.+\\.(ts|tsx)$': 'ts-jest',  // Преобразование TypeScript в JavaScript
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
    transformIgnorePatterns: [
      "/node_modules/(?!your-module-name).+\\.js$",
    ],
  };
  