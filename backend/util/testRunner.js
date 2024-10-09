const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const writeFileAsync = promisify(fs.writeFile);

exports.createTestFile = async (testCode, testName, testTool, framework) => {
    let testFilePath;
    if (testTool === 'Python') {
        testFilePath = path.join(__dirname, '../../tests', `test${testName}.py`);
    }
    else {
        if (framework === 'Playwright') {
            const testSuffix = testTool === 'Javascript' ? '.spec.js' : '.spec.ts';
            testFilePath = path.join(__dirname, '../../tests', `${testName}${testSuffix}`);
        }
        else {
            const testSuffix = testTool === 'Javascript' ? '.js' : '.ts';
            testFilePath = path.join(__dirname, '../../tests', `${testName}${testSuffix}`);
        }
    }

    // Write the generated test code to a new file
    await writeFileAsync(testFilePath, testCode);

    return testFilePath;
};
