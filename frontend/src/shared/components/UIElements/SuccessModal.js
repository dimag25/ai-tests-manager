import React from 'react';
import Modal from './Modal';
import Button from '../FormElements/Button';

const SuccessModal = props => ({ isVisible, message, onClose }) => {
  if (!isVisible) return null;

  return (
    <Modal
        onCancel={props.onClear}
        header="Success"
        show={message}
        footer={<Button onClick={onClose}>Close</Button>}
        >
      <p>{props.error}</p>
    </Modal>
  );
};

export default SuccessModal;
