require('dotenv').config();

const { OpenAI } = require("openai");
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});
    
exports.generateTestCode = async (testDescription, framework, testTool, includeVideo, includeScreenshots, retries = 5, delay = 10) => {
    try {
        // Logic to generate test case code based on the request inputs
        const testCasePrompt = `Create Full test case code via ${framework} using ${testTool} and 
            Test Case Description: ${testDescription} and
        ${includeVideo ? 'Attach code for test video inside Allure' : ''} and
        ${includeScreenshots ? 'Attach code for test screenshots inside Allure' : ''} and
          Attach allure step for each test step`;
        for (let attempt = 0; attempt < retries; attempt++) { 
            const response = await openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: testCasePrompt
                }],
                max_tokens: 800, // Adjust the max_tokens as needed
                temperature: 0.7, // Control the randomness of the output
                //stop: [";"] // Define stop sequences if needed, e.g., for JavaScript
            });
            let test_code;
            if (testTool === 'Python') {
                 test_code = extract_python_code_from_text(response.choices[0].message.content);
            }
            else {
                 test_code = extract_js_code_from_text(response.choices[0].message.content);
            }
            if (test_code != null){
                 return test_code;
            }
            continue
        }
        } catch (error) {
            console.error('Error calling the openai API:', error);
            return null;
        }
    }
    
exports.generateTestName = async (testDescription) => {
      const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [{
                role: "system",
                content: `Print testName for test with use case: ${testDescription}`
            }],
            max_tokens: 150, 
            temperature: 0.5,
            });
    return response.choices[0].message.content.split(":").
            pop().trim().replaceAll(' ', '').replaceAll('.', '');
};

exports.testCode = async (description) => {
    // Write your test code here
    const result =`
import pytest
def test_generated():
    # Generated based on description: ${description}
    assert True`;
    console.log("testDescription : " + description);
    console.log("result: " + result);
    return result;
};

function extract_python_code_from_text(text) {
    // Regular expression to find Python code blocks
    const pattern = /```python([\s\S]*?)```/;
    // Search for Python code blocks
    const match = text.match(pattern);
        
    if (match && match[1]) {
    // return the extracted Python code, trimming whitespace
            return match[1].trim()
    } else if (!text.contains('```')){
    return text;
    }
    return null;
}

function extract_js_code_from_text(text) {
    // Regular expression to find Python code blocks
    const pattern = /```javascript([\s\S]*?)```/;
    // Search for Python code blocks
    const match = text.match(pattern);
        
    if (match && match[1]) {
    // return the extracted Python code, trimming whitespace
            return match[1].trim()
    } else if (!text.includes('```')){
    return text;
    }
    return null;
}
