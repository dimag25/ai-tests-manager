import styled from 'styled-components';
import Checkbox from '@mui/material/Checkbox';

export const AppContainer = styled.div`
  display: flex;
  font-family: Arial, sans-serif;
  margin: 20px;
  padding: 0;
  background-color: #f4f4f4;
`;

export const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

export const SidebarContainer = styled.nav`
  width: 200px;
  background-color: #333;
  padding: 20px;
`;

export const TabButton = styled.button<{ active: boolean }>`
  background-color: ${(props: { active: any; }) => (props.active ? '#4CAF50' : 'inherit')};
  border: none;
  outline: none;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 16px;
  color: white;
  transition: background-color 0.3s;
  width: 100%;
  text-align: left;
  margin-bottom: 10px;

  &:hover {
    background-color: #4CAF50;
  }
`;

export const Select = styled.select`
  margin-bottom: 20px;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid #ccc;
`;

export const CustomCheckbox = styled(Checkbox)`
color: #1976D2;

&.Mui-checked {
  color: #2196F3;
}

&:hover {
  background-color: rgba(25, 118, 210, 0.08);
}
`;

export const TextArea = styled.textarea`
  width: 100%;
  min-height: 200px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

export const Button = styled.button`
  background-color: #4CAF50;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-top: 10px;

  &:hover {
    background-color: #45a049;
  }
`;

export const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 20px;
  background-color: #f4f4f4;
  border: 1px solid #ccc;
  border-radius: 5px;
  overflow: hidden;
  position: relative;

  &::after {
    content: '';
    display: block;
    height: 100%;
    width: ${(props) => props.progress}%;
    background-color: #4CAF50;
    transition: width 0.3s;
    position: absolute;
    left: 0;
    top: 0;
  }
`;

export const ProgressMessage = styled.div`
  margin-top: 5px;
  font-size: 14px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
`;

export const TableHeader = styled.th`
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
  background-color: #4CAF50;
  color: white;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #f2f2f2;
  }
`;

export const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

export const StyledLink = styled.a`
  color: #4CAF50;
  text-decoration: none;
  margin-right: 15px;

  &:hover {
    text-decoration: underline;
  }
`;

export const Modal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
`;

// Status-specific styles
export const StatusCell = styled(TableCell)<{ status: string }>`
  color: ${({ status }) => (status === 'Passed' ? 'green' : status === 'Failed' ? 'red' : 'inherit')};
  font-weight: bold;
`;

export const Option = styled.option`
  padding: 8px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  cursor: pointer;

  &:hover {
    background-color: #f0f0f0;
  }

  &:disabled {
    color: #aaa;
    background-color: #f9f9f9;
    cursor: not-allowed;
  }
`;

export const Alert = styled.div<{ status: 'running' | 'success' | 'failed' }>`
  padding: 16px;
  margin-top: 20px;
  border-radius: 5px;
  color: white;
  font-weight: bold;
  text-align: center;
  background-color: ${({ status }) =>
    status === 'success' ? 'green' :
    status === 'failed' ? 'red' : 
    'gray'};
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition: opacity 0.5s ease-in-out;
  opacity: 0.9;
`;