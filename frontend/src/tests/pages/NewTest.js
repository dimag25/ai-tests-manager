import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import axios from 'axios';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import SuccessModal from '../../shared/components/UIElements/SuccessModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './TestForm.css';
import { TextArea, Select } from '../../shared/components/styles';
import CustomCheckbox from '../../shared/components/UIElements/CustomCheckbox';

const Newtest = () => {
  const [includeVideo, setIncludeVideo] = useState(false);
  const [includeScreenshots, setIncludeScreenshot] = useState(false);

  const handleChecboxVideo = (event) => {
    setIncludeVideo(event.target.checked);
  };

  const handleChecboxScreenshot = (event) => {
    setIncludeScreenshot(event.target.checked);
  };

  const [framework, setFramework] = useState('Playwright');
  const [testLanguage, setTestLanguage] = useState('Javascript');
  // const [isModalVisible, setIsModalVisible] = useState(false);
  // const [successMessage, setSuccessMessage] = useState('');

  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError, setError ,setSuccessMessage,successMessage } = useHttpClient();
  const [formState, inputHandler] = useForm(
    {
      name: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      framework: {
        value: framework,
        isValid: true
      },
      testLanguage: {
        value: testLanguage,
        isValid: true
      },
      content: {
        value: '',
        isValid: true
      },
    },
    false
  );

  const history = useHistory();



  const testSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        'http://localhost:5000/api/tests/save-test',
        'POST',
        JSON.stringify({
          name: formState.inputs.name.value,
          description: formState.inputs.description.value,
          content: formState.inputs.content.value,
          framework: formState.inputs.framework.value,
          testLanguage: formState.inputs.testLanguage.value,
          creator: auth.userId
        }),
        { 'Content-Type': 'application/json' }
      );
      history.push('/');
    } catch (err) { }
  };

  const generateNewTest = async event => {
    try {
      const includeVideo = false;
      const includeScreenshots = true;
      event.preventDefault();
      const response = await sendRequest('http://localhost:5000/api/tests/generate-test',
        'POST',
        JSON.stringify({
          name: formState.inputs.name.value,
          description: formState.inputs.description.value,
          framework: formState.inputs.framework.value,
          testLanguage: formState.inputs.testLanguage.value,
          includeVideo,
          includeScreenshots,
          creator: auth.userId
        }),
        { 'Content-Type': 'application/json' }
      );
      console.log("response ==>" , JSON.stringify(response))
      setSuccessMessage(`Test generated successfully: ${response.name}`);
      inputHandler('content', response.testCode, true);  // Update test content

    } catch (err) {
      setError(err.message || 'Something went wrong while genereting test, please try again.');
      console.log(err);
    }
  };


  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <SuccessModal
        message={successMessage}
        //onClose={handleClose}
      />
      <form className="test-form" onSubmit={testSubmitHandler}>
        {isLoading && <LoadingSpinner asOverlay />}


        <Input
          id="name"
          element="input"
          type="text"
          label="Test Name"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a valid title."
          onInput={inputHandler}
        />
        <Input
          id="description"
          element="input"
          label="Test Description"
          validators={[VALIDATOR_MINLENGTH(5)]}
          errorText="Please enter a valid description (at least 5 characters)."
          onInput={inputHandler}
        />

        <label htmlFor="frameworkSelect"> UI Framework </label><br></br>
        <Select
          id="frameworkSelect"
          value={formState.inputs.framework.value}  // Get the value from formState
          validators={[VALIDATOR_REQUIRE()]}
          onChange={(e) => inputHandler('framework', e.target.value, true)}  // Update formState on change
          >
          <option value="Playwright">Playwright</option>
          <option value="Selenium">Selenium</option>
        </Select>
        <br></br>
        <label htmlFor="testToolSelect"> Testing Language </label><br></br>
        <Select
          id="testToolSelect"
          value={formState.inputs.testLanguage.value}  // Get the value from formState
          validators={[VALIDATOR_REQUIRE()]}
          onChange={(e) => inputHandler('testLanguage', e.target.value, true)}  // Update formState on change
          >
          <option value="Javascript">Javascript</option>
          <option value="Python">Python</option>
        </Select>
        <br></br>Attach Screenshots<br></br>
        <CustomCheckbox checked={includeScreenshots} onChange={handleChecboxScreenshot}
        />
        <br></br>Attach Video<br></br>
        <CustomCheckbox checked={includeVideo} onChange={handleChecboxVideo} />
        <br></br>
        <Button type="generate" disabled={!formState.isValid} onClick={generateNewTest}>
          Generate test from AI
        </Button>
        <br></br>
        <br></br>Test Code<br></br>
        <TextArea
          id="content"
          element="textarea"
          label="Test Content"
          validators={[VALIDATOR_REQUIRE()]}
          errorText="Please enter a test code."
          onInput={inputHandler}
          value={formState.inputs.content.value}  // Bind the value to the form state
        />
        <Button type="submit" disabled={!formState.isValid}>
          Save test
        </Button>
      </form>
    </React.Fragment>
  );
};

export default Newtest;
