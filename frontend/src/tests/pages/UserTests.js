// UserTests.js
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import TestList from '../components/TestList';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import { useHttpClient } from '../../shared/hooks/http-hook';
import axios from 'axios';

const Usertests = () => {
  const [loadedTests, setLoadedTests] = useState([]);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const userId = useParams().userId;
  const [editingTest, setEditingTest] = useState(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        const responseData = await sendRequest(`http://localhost:5000/api/tests/user/${userId}`);
        setLoadedTests(responseData.tests);
      } catch (err) {}
    };
    fetchTests();
  }, [sendRequest, userId]);

  const runTest = async (test) => {
    const updatedTests = loadedTests.map(t =>
      t.name === test.name ? { ...t, status: 'Running...', result: 'N/A', duration: 'Calculating...' } : t
    );
    setLoadedTests(updatedTests);
    const startTime = new Date();

    try {
      const response = await axios.get(`http://localhost:5000/api/tests/run-test/${test.id}`);
      const endTime = new Date();
      const duration = ((endTime.getTime() - startTime.getTime()) / 1000).toFixed(2);

      const updatedTest = {
        ...test,
        status: response.data.status === 'success' ? 'Passed' : 'Failed',
        result: response.data.result,
        duration: `${duration} seconds`,
      };

      setLoadedTests((prevTests) =>
        prevTests.map((t) => (t.id === updatedTest.id ? updatedTest : t))
      );
    } catch (error) {
      console.error('Error running test:', error);
    }
  };

  const handleEdit = async (test) => {
    console.log('Editing test:', test.name);
    // logic for editing test
      try {
        const response = await sendRequest(`http://localhost:5000/api/tests/${test.id}`);
        console.log('Fetched Test Data:', response.test); // Debugging
        setEditingTest(response.test);
      } catch (error) {
        console.error(`Error fetching test ${test.id} for editing:`, error);
      }
    };

  const deleteTest = async (test) => {
    try {
      await sendRequest(`http://localhost:5000/api/tests/${test.id}`, 'DELETE');
      setLoadedTests((prevTests) => prevTests.filter((test) => test.id !== test.id));
    } catch (err) {}
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedTests && (
        <TestList
          items={loadedTests}
          runTest={runTest}
          handleEdit={handleEdit}
          onDeletetest={deleteTest}
        />
      )}
    </React.Fragment>
  );
};

export default Usertests;
