// jest.config.js
module.exports = {
testEnvironment: 'node',
testMatch: ['**/tests/**/*.js'], 
reporters: ['default', ['jest-allure', {outputDirectory: 'allure-results'}]],
};