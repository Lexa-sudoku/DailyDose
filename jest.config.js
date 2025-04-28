module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',  // Для JS файлов
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
  transformIgnorePatterns: [
    '/node_modules/(?!expo-notifications|other-modules-to-transform).*/', // Обрабатываем expo-notifications и другие модули
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
  },
};
