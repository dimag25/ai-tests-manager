import React, { useState, useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/theme-monokai';
//import './EditModal.css';
import { Button } from '../styles';

type EditModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSave: (content: string) => void;
  initialContent: string;
};

const EditModal: React.FC<EditModalProps> = ({ isOpen, onClose, onSave, initialContent }) => {
  const [content, setContent] = useState(initialContent);
  const [showMessage, setShowMessage] = useState<string | null>(null);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  if (!isOpen) return null;
  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(content)
      .then(() => setShowMessage('Copied to clipboard'))
      .catch(error => console.error('Error copying to clipboard:', error));
  };

  const handleFixTestCode = () => {
    const userPrompt = prompt('Describe the problem or the desired fix:');
    if (!userPrompt) return;
    const suggestTestFixPrompt = `The following test code: ${content} failed with the error :\n\n${userPrompt}\n\nPlease suggest a fix.
    \n Please return applied fix inside the full provided test code with same code.`;

    fetch('http://localhost:5000/api/tests/fix-test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({  testCode: content, prompt: suggestTestFixPrompt }),
    })
      .then(response => response.json())
      .then(data => {
        setContent(data.fixedCode);
        setShowMessage('Test code fixed. Please review and save changes.');
      })
      .catch(error => {
        console.error('Error fixing test code:', error);
        setShowMessage('Failed to fix test code.');
      });
  };

  return (
    <dialog open className="editor-dialog">
      <div id="editor">
        <AceEditor
          mode="python"
          theme="monokai"
          value={content}
          onChange={newValue => setContent(newValue)}
          name="editor"
          editorProps={{ $blockScrolling: true }}
          width="700px"
          height="700px"
        />
      </div>
      <div className="modal-actions">
        <Button onClick={handleSave} className="styled-button">Save Changes</Button>
        <Button onClick={handleCopyToClipboard} className="styled-button">Copy to Clipboard</Button>
        <Button onClick={handleFixTestCode} className="styled-button">Gen AI Fix</Button>
        <Button onClick={onClose} className="styled-button">Close Editor</Button>
      </div>
      {showMessage && <div className="message">{showMessage}</div>}
    </dialog>
  );
};

export default EditModal;
