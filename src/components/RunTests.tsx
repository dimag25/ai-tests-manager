import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Table, TableHeader, TableRow, TableCell, Button, StatusCell, Select, Option, Alert } from './styles';
import EditModal from './EditModal';
import { report } from 'process';
import { error } from 'console';

interface Test {
  runLink: string;
  name: string;
  status: string;
  result: string;
  duration: string;
  content: string;
  logUrl?: string;
  report: string;
  testLanguage: string;
}

const RunTests: React.FC = () => {
  const [tests, setTests] = useState<Test[]>([]);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [testName, setTestName] = useState<String | null>(null);
  const [runningTestName, setRunningTestName] = useState<string | null>(null);
  const [testContent, setTestContent] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('javascript');
  const [message, setMessage] = useState<{ text: string, status: 'running' | 'success' | 'failed' } | null>(null);
  const [success, setSuccess] = useState<boolean>(true); // Track if the message is success or failed



  useEffect(() => {
    fetchTests(selectedLanguage); // Fetch tests based on selected language
  }, [selectedLanguage]);

  const fetchTests = async (language: string = '') => {
    try {
      const response = await axios.get(`http://localhost:5000/api/tests?language=${language}`);
      setTests(response.data);
      setSuccess(true);
    } catch (error) {
      console.error('Error fetching tests:', error);
      setMessage({ text: 'Failed load tests', status: 'failed' });
      setSuccess(false);
    }
  };

  const runTest = async (test: Test) => {
    const updatedTests = tests.map(t =>
      t.name === test.name ? { ...t, status: 'Running...', result: 'N/A', report: 'N/A', duration: 'Calculating...' } : t
    );

    setTests(updatedTests);
    const startTime = new Date();
    // updateTestStatus(test.name, 'Running', 0, 'Running Test...', '...','...');

    try {
      const response = await axios.get(`http://localhost:5000/api/tests${test.runLink}`);
      //const { status, result, message , reportUrl, logUrl } = response.data;
      console.log("runTest Response = " + JSON.stringify(response.data))
      const endTime = new Date();
      const duration = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
      const data = response.data;

      const status = data.status === 'success' ? 'Passed' : 'Failed';
      const report = `<a href="http://localhost:5000${data.reportUrl}" target="_blank">View Report</a>`;
      const result = `<a href="http://localhost:5000${data.logUrl}" target="_blank">${data.result}<br> View Log</a>`;
      const updatedTestsAfterRun = tests.map(t =>
        t.name === test.name ? { ...t, status, result, report, duration: `${duration} seconds` } : t
      );
      setTests(updatedTestsAfterRun);
      setMessage({ text: `Test Run ${status}: ${test.name}`, status: data.status });
      setSuccess(true);
    } catch (error) {
      const updatedTestsAfterError = tests.map(t =>
        t.name === test.name ? { ...t, status: 'Failed', result: `Error running test: ${error}`, report: test.report, duration: 'N/A' } : t
      );
      setTests(updatedTestsAfterError);
      console.error(`Error running test ${test.runLink}:`, error);
      setMessage({ text: `Test Run Error: ${test.name}`, status: 'failed' });
      setSuccess(false);
    }
    finally {
      setRunningTestName(null);
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedLanguage(e.target.value);
    fetchTests();
  };

  const handleFixTest = async (test: Test) => {
    if (!test.logUrl) return;

    try {
      // Retrieve the error log
      const logResponse = await axios.get(test.logUrl);
      const errorLog = logResponse.data;

      // Send error log to OpenAI for fixing suggestions
      const fixResponse = await axios.post('http://localhost:5000/api/fix-test', {
        testcode: test.content, errorLog: errorLog, //testTool: extractTestLanauge(test),
      });

      const suggestedFix = fixResponse.data.suggestedFix;

      // Open the edit modal with the suggested fix
      setEditingTest({ ...test, content: suggestedFix });
      setTestContent(suggestedFix);
    } catch (error) {
      console.error('Error fixing test:', error);
    }
  };


  const handleSaveEdit = async (updatedContent: string) => {
    console.log("updatedContent = " + JSON.stringify(updatedContent));
    console.log("testName = " + testName);

    if (editingTest) {
      try {
        await axios.put(`http://localhost:5000/api/tests/${testName}`, {
          content: updatedContent, testName: testName
        });
        setEditingTest(null);
        fetchTests(); // Refresh the list after editing
        window.alert(`Test : ${testName} Succefully Saved!`)
      } catch (error) {
        console.error(`Error updating test ${editingTest.name}:`, error);
      }
    }
  };


  const handleEdit = async (name: string) => {
    console.log('Selected Test:', name);
    setTestName(name);
    try {
      const response = await axios.get(`http://localhost:5000/api/tests/${name}`);
      console.log('Fetched Test Data:', response.data); // Debugging
      setEditingTest(response.data);
    } catch (error) {
      console.error(`Error fetching test ${name} for editing:`, error);
    }
  };



  const deleteTest = async (name: string) => {
    try {
      const confirmed = window.confirm(`Are you sure you want to delete test: ${name}?`);
      if (confirmed) {
        //Logic to delete the test
        await axios.delete(`http://localhost:5000/api/tests/${name}`);
        fetchTests(); // Refresh the list after deleting the test
      }

    } catch (error) {
      console.error(`Error deleting test ${name}:`, error);
    }
  };

  const generateReport = async (reportLink: string) => {
    try {
      setMessage({ text: `Generating report..`, status: 'running' });
      const response = await axios.get(reportLink);
      console.log("generateReport Response:" + JSON.stringify(response.data))
      setTimeout(() => {
        console.log("Waited for 5 seconds");
        setMessage({ text: `Report generated successfully!'`, status: 'success' });
      }, 5000);

    } catch (error) {
      window.alert('Failed to generate report.');
      console.error('Error generating report:', error);
    }
  };

  const runAllTestsByLanguage = async (language: string) => {
    setMessage({ text: `Running all ${language} tests..`, status: 'running' });
    try {
      await axios.get(`http://localhost:5000/api/run-all-tests?language=${language}`);
      fetchTests();  // Refresh the list after running all tests
      setMessage({ text: `All ${language} tests finished!`, status: 'success' });
    } catch (error) {
      console.error(`Error running all ${language} tests:`, error);
      setMessage({ text: `Failed to run all ${language} tests.`, status: 'failed' });
      setSuccess(false);
    }
  };

  return (
    <div>
      <h2>Available Tests</h2>
      <Select value={selectedLanguage} onChange={handleLanguageChange}>
        <Option value="javascript">JavaScript</Option>
        <Option value="python">Python</Option>
        <Option value="typescript">TypeScript</Option>
        {/* Add more languages as needed */}
      </Select>

      <Table>
        <thead>
          <TableRow>
            <TableHeader>Test Name</TableHeader>
            <TableHeader>Run Test</TableHeader>
            <TableHeader>Edit</TableHeader>
            <TableHeader>Delete</TableHeader>
            <TableHeader>Test Result</TableHeader>
            <TableHeader>Report</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Duration</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {tests.map((test) => (
            <TableRow key={test.runLink}>
              <TableCell>{test.name}</TableCell>
              <TableCell>
                <Button onClick={() => runTest(test)}>Run</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(test.name)}>Edit</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => deleteTest(test.name)}>Delete</Button>
              </TableCell>
              <TableCell dangerouslySetInnerHTML={{ __html: test.result }}></TableCell>
              <TableCell dangerouslySetInnerHTML={{ __html: test.report }}></TableCell>
              <StatusCell status={test.status}>{test.status}</StatusCell>
              <TableCell>{test.duration}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
      <Button onClick={() => runAllTestsByLanguage(selectedLanguage)}>Run All {selectedLanguage} Tests</Button>

      <Button onClick={() => generateReport('http://localhost:5000/api/serve-allure-reports')}>
        Generate Allure Report
      </Button>
      {message && (
      <Alert status={message.status}>
        {message.text}
      </Alert>
)}
      {editingTest && (
        <EditModal
          isOpen={!!editingTest}
          onClose={() => setEditingTest(null)}
          onSave={handleSaveEdit} // Pass the function to save updated content
          initialContent={editingTest.content || ""}  // Fallback to empty string if undefined
        />
      )}
    </div>
  );
};

export default RunTests;