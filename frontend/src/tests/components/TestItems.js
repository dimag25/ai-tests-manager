import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';

import Card from '../../shared/components/UIElements/Card';
import Button from '../../shared/components/FormElements/Button';
import Modal from '../../shared/components/UIElements/Modal';
import Map from '../../shared/components/UIElements/Map';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import './TestItems.css';
import EditModal from '../../shared/components/UIElements/EditModal';
import { Table, TableRow, TableHeader, TableCell, StatusCell, Alert } from '../../shared/components/styles';

import { useParams } from 'react-router-dom';

const TestItem = props => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [showMap, setShowMap] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [editingTest, setEditingTest] = useState(null);
  const [testName, setTestName] = useState(null);
  const [tests, setTests] = useState([]);
  const [message, setMessage] = useState(null);
  const [success, setSuccess] = useState(true); // Track if the message is success or failed
  const [runningTestName, setRunningTestName] = useState(null);
  const [testID, setTestId] = useState('');
  const [selectedTest, setSelectedTest] = useState(null); // State to hold the test to be deleted

  const userId = useParams().userId;

  //fetch tests by user id
  useEffect(() => {
    fetchTests();
  }, [sendRequest, userId]);

  const fetchTests = async () => {
    try {
      const responseData = await sendRequest(
        `http://localhost:5000/api/tests/user/${userId}`
      );
      setTests(responseData.tests);
    } catch (err) { }
  };

  const showDeleteWarningHandler = (test) => {
    setSelectedTest(test); // Set the selected test to be deleted
    setShowConfirmModal(true);
  };

  const cancelDeleteHandler = () => {
    setShowConfirmModal(false);
    setSelectedTest(null); // Clear the selected test
  };

  const confirmDeleteHandler = async () => {
    if (!selectedTest) return; // If no test selected, do nothing

    setShowConfirmModal(false);
    try {
      const response = await sendRequest(
        `http://localhost:5000/api/tests/${selectedTest.id}`,
        'DELETE'
      );
      window.alert(response.message);
      fetchTests();
      props.onDelete(selectedTest.id);
      setSelectedTest(null); // Clear the selected test after deletion
    } catch (err) { }
  };

  const handleSaveEdit = async (updatedContent) => {
    if (editingTest) {
      try {
        await axios.put(`http://localhost:5000/api/tests/${props.creatorId}`, {
          content: updatedContent, testName: testName
        });
        setEditingTest(null);
        window.alert(`Test : ${testName} Successfully Saved!`)
      } catch (error) {
        console.error(`Error updating test ${editingTest.name}:`, error);
      }
    }
  };

  const handleEdit = async (testId) => {
    try {
      const response = await sendRequest(`http://localhost:5000/api/tests/${testId}`);
      setEditingTest(response.test);
    } catch (error) {
      console.error(`Error fetching test ${testId} for editing:`, error);
    }
  };

  const runTest = async (test) => {
    const updatedTests = tests.map(t =>
      t.name === test.name ? { ...t, status: 'Running...', result: 'N/A', report: 'N/A', duration: 'Calculating...' } : t
    );

    setTests(updatedTests);
    const startTime = new Date();

    try {
      const response = await axios.get(`http://localhost:5000/api/tests/run-test/${test.id}`);
      const endTime = new Date();
      const duration = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);
      const data = response.data;

      const status = data.status === 'success' ? 'Passed' : 'Failed';
      const logUrl = `http://localhost:5000/api/logs/${test.name}`;
      const result = `<a href="${logUrl}" target="_blank">${data.result}<br> View Log</a>`;
      const updatedTestsAfterRun = tests.map(t =>
        t.name === test.name ? { ...t, status, result, duration: `${duration} seconds` } : t
      );
      setTests(updatedTestsAfterRun);
      setMessage({ text: `Test Run ${status}: ${test.name}`, status: data.status });
      setSuccess(true);
    } catch (error) {
      const updatedTestsAfterError = tests.map(t =>
        t.name === test.name ? { ...t, status: 'Failed', result: `Error running test: ${error}`, duration: 'N/A' } : t
      );
      setTests(updatedTestsAfterError);
      setMessage({ text: `Test Run Error: ${test.name}`, status: 'failed' });
      setSuccess(false);
    } finally {
      setRunningTestName(null);
    }
  };

  const generateReport = async () => {
    const generateReportApi = `http://localhost:5000/api/reports/generate-report`;
    try {
      setMessage({ text: 'Generating report...', status: 'running' });
      const response = await axios.post(generateReportApi);

      // Check if the URL was returned successfully
      if (response.data && response.data.reportDirectory) {
        console.log('Opening report at:', response.data.reportDirectory);
        setTimeout(() => {
          setMessage({ text: `Report generated successfully!'`, status: 'success' });
          window.open(response.data.reportDirectory, '_blank');
        }, 3000);
      } else {
        throw new Error('No report URL received');
      }
    } catch (error) {
      window.alert('Failed to generate report.');
      console.error('Error generating report:', error);
      setMessage({ text: 'Failed to generate report!', status: 'failed' });
    }
  };

  const openReport = async (reportLink) => {
    try {
      await axios.get(reportLink);
    } catch (error) {
      window.alert('Failed to open report');
      console.error('Error open report:', error);
    }
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />

      {editingTest && (
        <EditModal
          isOpen={!!editingTest}
          onClose={() => setEditingTest(null)}
          onSave={handleSaveEdit}
          initialContent={editingTest.content || ""}
        />
      )}

      <Table>
        <thead>
          <TableRow>
            <TableHeader>Test Name</TableHeader>
            <TableHeader>Test Description</TableHeader>
            <TableHeader>Test Framework</TableHeader>
            <TableHeader>Run Test</TableHeader>
            <TableHeader>Edit Test Data</TableHeader>
            <TableHeader>Edit Test Code</TableHeader>
            <TableHeader>Delete</TableHeader>
            <TableHeader>Test Result</TableHeader>
            <TableHeader>Status</TableHeader>
            <TableHeader>Duration</TableHeader>
          </TableRow>
        </thead>

        <tbody>
          {tests.map((test) => (
            <TableRow key={test.runLink}>
              <TableCell>{test.name}</TableCell>
              <TableCell>{test.description}</TableCell>
              <TableCell>{test.framework}|{test.testLanguage}</TableCell>
              <TableCell>
                <Button onClick={() => runTest(test)}>Run</Button>
              </TableCell>
              <TableCell>
                <Button to={`/tests/${test.id}`} onClick={() => handleEdit(test.id)}>Edit Data</Button>
              </TableCell>
              <TableCell>
                <Button onClick={() => handleEdit(test.id)}>Edit Code</Button>
              </TableCell>
              <TableCell>
                <Button danger onClick={() => showDeleteWarningHandler(test)}>
                  DELETE
                </Button>
              </TableCell>
              <TableCell dangerouslySetInnerHTML={{ __html: test.result }}></TableCell>
              <StatusCell status={test.status}>{test.status}</StatusCell>
              <TableCell>{test.duration}</TableCell>
            </TableRow>
          ))}
        </tbody>
        <Button onClick={() => generateReport()}>
          Generate Allure Report
        </Button>
      </Table>

      {message && (
        <Alert status={message.status}>
          {message.text}
        </Alert>
      )}

      {selectedTest && (
        <Modal
          show={showConfirmModal}
          onCancel={cancelDeleteHandler}
          header="Are you sure?"
          footerClass="place-item__modal-actions"
          footer={
            <React.Fragment>
              <Button inverse onClick={cancelDeleteHandler}>
                CANCEL
              </Button>
              <Button danger onClick={confirmDeleteHandler}>
                DELETE
              </Button>
            </React.Fragment>
          }
        >
          <p>
            Do you want to proceed and delete the test: <strong>{selectedTest.name}</strong>? Please note that this action cannot be undone.
          </p>
        </Modal>
      )}
    </React.Fragment>
  );
};

export default TestItem;
