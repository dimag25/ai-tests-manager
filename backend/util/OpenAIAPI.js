require('dotenv').config();
const { OpenAI } = require("openai");

class OpenAIAPI {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });
    }

    async generateTestCode(testDescription, framework, testTool, includeVideo, includeScreenshots, retries = 5, delay = 10) {
        try {
            const testCasePrompt = `Create Full test case code via ${framework} using ${testTool} and 
                Test Case Description: ${testDescription} and
                ${includeVideo ? 'Attach code for test video inside Allure' : ''} and
                ${includeScreenshots ? 'Attach code for test screenshots inside Allure' : ''} and
                Attach allure step for each test step`;

            for (let attempt = 0; attempt < retries; attempt++) {
                const response = await this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: testCasePrompt
                    }],
                    max_tokens: 800,
                    temperature: 0.7,
                });

                let testCode;
                if (testTool === 'Python') {
                    testCode = this.extractCodeFromText(response.choices[0].message.content, 'python');
                } else if (testTool === 'Javascript') {
                    testCode = this.extractCodeFromText(response.choices[0].message.content, 'javascript');
                } else if (testTool === 'Typescript') {
                    testCode = this.extractCodeFromText(response.choices[0].message.content, 'typescript');
                }

                if (testCode != null) {
                    return testCode;
                }
            }
            throw new Error('Failed to generate test code after multiple attempts');
        } catch (error) {
            console.error('Error calling the OpenAI API:', error);
            throw error;
        }
    }

    async generateSuggestionTestFix(suggestTestFixPrompt,testTool, retries = 5) {
        try {
            // Send error log and test code to OpenAI for fixing suggestions
            // const suggestTestFixPrompt = `The following test code: ${testCode} failed with the error log:\n\n${errorLog}\n\nPlease suggest a fix.
            // \n Please Change only the failed test code line!`;

            for (let attempt = 0; attempt < retries; attempt++) {
                const response = await this.openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [{
                        role: "system",
                        content: suggestTestFixPrompt
                    }],
                    max_tokens: 800,
                    temperature: 0.7,
                });

                let testCode;
                if (testTool === 'Python') {
                    testCode = this.extractCodeFromText(response.choices[0].message.content, 'python');
                } else if (testTool === 'Javascript') {
                    testCode = this.extractCodeFromText(response.choices[0].message.content, 'javascript');
                } else if (testTool === 'Typescript') {
                    testCode = this.extractCodeFromText(response.choices[0].message.content, 'typescript');
                }

                if (testCode != null) {
                    return testCode;
                }
            }
            throw new Error('Failed to generate test fix after multiple attempts');
        } catch (error) {
            console.error('Error calling the OpenAI API:', error);
            throw error;
        }
    }

    async generateTestName(testDescription) {
        try {
            const response = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: `Print testName for test with use case: ${testDescription}`
                }],
                max_tokens: 150,
                temperature: 0.5,
            });
            return response.choices[0].message.content.split(":")
                .pop().trim().replaceAll(' ', '').replaceAll('.', '');
        } catch (error) {
            console.error('Error generating test name:', error);
            throw error;
        }
    }

    extractCodeFromText(text, language) {
        const pattern = new RegExp(`\`\`\`${language}([\\s\\S]*?)\`\`\``);
        const match = text.match(pattern);

        if (match && match[1]) {
            return match[1].trim();
        } else if (!text.includes('```')) {
            return text;
        }
        return null;
    }
}

module.exports = OpenAIAPI;