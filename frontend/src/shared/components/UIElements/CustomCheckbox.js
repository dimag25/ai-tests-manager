// CustomCheckbox.tsx
import React from 'react';
import styled from 'styled-components';

const StyledCheckbox = styled.input.attrs({ type: 'checkbox' })`
  width: 20px;
  height: 20px;
  background-color: #fff;
  border: 2px solid #2196F3;
  border-radius: 4px;
  appearance: none;
  cursor: pointer;

  &:checked {
    background-color: #2196F3;
  }

  &:hover {
    border-color: #1976D2;
  }
`;


const CustomCheckbox = ({ checked, onChange }) => (
  <StyledCheckbox checked={checked} onChange={onChange} />
);

export default CustomCheckbox;
