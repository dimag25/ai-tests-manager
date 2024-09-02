const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const writeFileAsync = promisify(fs.writeFile);

exports.createTest = async (testCode, testName, testTool, framework) => {
    let testFilePath;
    if (testTool === 'Python') {
        testFilePath = path.join(__dirname, 'tests', `test_${testName}.py`);
    }
    else {
        if (framework === 'playwright') {
            const testSuffix = testTool === 'Javascript' ? '.spec.js' : '.spec.ts';
            testFilePath = path.join(__dirname, 'tests', `test_${testName}${testSuffix}`);
        }
        else {
            const testSuffix = testTool === 'Javascript' ? '.js' : '.ts';
            testFilePath = path.join(__dirname, 'tests', `test_${testName}${testSuffix}`);
        }
    }

    // Write the generated test code to a new file
    await writeFileAsync(testFilePath, testCode);

    return testFilePath;
};
