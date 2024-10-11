// TestList.js
import React from 'react';
import TestItems from './TestItems';
import './TestList.css';

const TestList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="test-list center">
        <h2>No tests found. Maybe create one?</h2>
      </div>
    );
  }

  return (
    <div className="test-list">
      {/* {props.items.map((test) => ( */}
        <TestItems
          key={props.id}
          id={props.id}
          content={props.content}
          name={props.name}
          description={props.description}
          testLanguage={props.testLanguage}
          creatorId={props.creator}
          framework={props.framework}
          runTest={props.runTest}
          onDeletetest={props.onDeletetest}
          handleEdit={props.handleEdit}
        />
      {/* ))} */}
    </div>
  );
};

export default TestList;
