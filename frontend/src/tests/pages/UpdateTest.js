import React, { useEffect, useState, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import {
  VALIDATOR_REQUIRE,
  VALIDATOR_MINLENGTH
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { useHttpClient } from '../../shared/hooks/http-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './TestForm.css';



const Updatetest = props => {
  const auth = useContext(AuthContext);
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [loadedtest, setLoadedtest] = useState();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const testId = useParams().testId;

  const history = useHistory();

  const [formState, inputHandler, setFormData] = useForm(
    {
      name: {
        value: '',
        isValid: false
      },
      description: {
        value: '',
        isValid: false
      },
      content: {
        value: '',
        isValid: false
      }
    },
    false
  );


  useEffect(() => {
    const fetchtest = async () => {
      try {
        const responseData = await sendRequest(
          `http://localhost:5000/api/tests/${testId}`
        );
        setLoadedtest(responseData.test);
        setFormData(
          {
            name: {
              value: responseData.test.name,
              isValid: true
            },
            description: {
              value: responseData.test.description,
              isValid: true
            },
            content: {
              value: responseData.test.content,
              isValid: true
            }
          },
          true
        );

      } catch (err) {}
    };
    fetchtest();
  }, [sendRequest, testId, setFormData]);

  const testUpdateSubmitHandler = async event => {
    event.preventDefault();
    try {
      await sendRequest(
        `http://localhost:5000/api/tests/${testId}`,
        'PATCH',
        JSON.stringify({
          name: formState.inputs.name.value,
          description: formState.inputs.description.value,
          content: formState.inputs.content.value

        }),
        {
          'Content-Type': 'application/json'
        }
      );
      history.push('/' + auth.userId + '/tests');
    } catch (err) {}
  };

  if (isLoading) {
    return (
      <div className="center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!loadedtest && !error) {
    return (
      <div className="center">
        <Card>
          <h2>Could not find test!</h2>
        </Card>
      </div>
    );
  }


  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
    
      {!isLoading && loadedtest && (
        <form className="test-form" onSubmit={testUpdateSubmitHandler}>
          <Input
            id="name"
            element="input"
            type="text"
            label="Name"
            validators={[VALIDATOR_REQUIRE()]}
            errorText="Please enter a valid title."
            onInput={inputHandler}
            initialValue={loadedtest.name}
            initialValid={true}
          />
          <Input
            id="description"
            element="input"
            label="Description"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid description (min. 5 characters)."
            onInput={inputHandler}
            initialValue={loadedtest.description}
            initialValid={true}
          />
          <Input
            id="content"
            element="textarea"
            label="Test Code"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid content (min. 5 characters)."
            onInput={inputHandler}
            initialValue={loadedtest.content}
            initialValid={true}
          />
          <Button type="submit" disabled={!formState.isValid}>
            UPDATE TEST
          </Button>
        </form>
            
      )}
    </React.Fragment>
  );
};

export default Updatetest;
