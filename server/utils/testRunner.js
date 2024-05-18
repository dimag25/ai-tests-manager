const { exec } = require('child_process');
const fs = require('fs');
const { promisify } = require('util');
const path = require('path');

const writeFileAsync = promisify(fs.writeFile);

exports.createTest = async (testCode, testName, testTool, framework) => {
    let testFilePath;
    if (testTool === 'Python') {
        testFilePath = path.join(__dirname, '../..', 'tests', 'generated', `test_${testName}.py`);
    }
    else {
        if (framework === 'Playwright') {
            testFilePath = path.join(__dirname, '../..', 'tests', 'generated', `test_${testName}.spec.js`);
        }
        else {
            testFilePath = path.join(__dirname, '../..', 'tests', 'generated', `test_${testName}.js`);
        }
    }

    // Write the generated test code to a new file
    await writeFileAsync(testFilePath, testCode);

    return testFilePath;
};
