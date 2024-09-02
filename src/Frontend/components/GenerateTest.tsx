import React, { useState } from 'react';
import axios from 'axios';
import {
  Select,
  TextArea,
  Button,
  ProgressBar,
  ProgressMessage,
} from './styles';

import CustomCheckbox from './CustomCheckbox'; // Adjust the import path as needed



const GenerateTest: React.FC = () => {
  const [framework, setFramework] = useState<string>('playwright');
  const [testTool, setTestTool] = useState<string>('Python');

  const [testDescription, setTestDescription] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [message, setMessage] = useState<string>('');


  //const [isChecked, setIsChecked] = useState(false);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [includeScreenshots, setIncludeScreenshot] = useState(false);

  const handleChecboxVideo = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeVideo(event.target.checked);
  };

  const handleChecboxScreenshot = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIncludeScreenshot(event.target.checked);
  };


  const generateNewTest = async () => {
    setProgress(10);
    setMessage('Generating test...');
    try {
      const response = await axios.post('http://localhost:5000/api/generate-test', {
        testDescription,
        framework,
        testTool,
        includeVideo,
        includeScreenshots,
      });
      setProgress(100);
      setMessage(`Test generated successfully: ${response.data.testName}`);
    } catch (error) {
      setProgress(0);
      setMessage('Error generating test');
    }
  };

  

  return (
    <div>
      <h2>Generate New Test</h2>
      <label htmlFor="frameworkSelect">UI Framework</label>
      <Select
        id="frameworkSelect"
        value={framework}
        onChange={(e) => setFramework(e.target.value)}
      >
        <option value="playwright">Playwright</option>
        <option value="selenium">Selenium</option>
      </Select>

      <label htmlFor="testToolSelect">Testing Language</label>
      <Select
        id="testToolSelect"
        value={testTool}
        onChange={(e) => setTestTool(e.target.value)}
      >
        <option value="Python">Python</option>
        <option value="Javascript">Javascript</option>
      </Select>

        <br></br>Attach Screenshot
        <CustomCheckbox checked={includeScreenshots} onChange={handleChecboxScreenshot} />


        <br></br>Attach Video
        <CustomCheckbox checked={includeVideo} onChange={handleChecboxVideo} />

      <TextArea
        value={testDescription}
        onChange={(e) => setTestDescription(e.target.value)}
        placeholder="Enter test description..."
      />

      <Button onClick={generateNewTest}>Generate Test</Button>

      <ProgressBar/>
      <ProgressMessage>{message}</ProgressMessage>
    </div>
  );
};

export default GenerateTest;