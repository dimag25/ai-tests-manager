
import styled from 'styled-components';
import { ProgressBar as BPProgressBar } from 'react-bootstrap';

export const Content = styled.div`
  flex: 1;
  padding: 20px;
`;

export const AppContainer = styled.div`
  display: flex;
  font-family: Arial, sans-serif;
  margin: 20px;
  padding: 0;
  background-color: #f4f4f4;
`;

export const SidebarContainer = styled.nav`
  width: 200px;
  background-color: 007bff;
  padding: 20px;
`;

export const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;

  & th, & td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }

  & th {
    background-color: #1e99d6;
    text-transform: uppercase;
  }

  & tr:hover {
    background-color: #f1f1f1;
    cursor: pointer;
  }
`;

export const Badge = styled.span<{ status: 'running' | 'success' | 'failure' }>`
  padding: 5px 10px;
  border-radius: 5px;
  color: white;
  background-color: ${({ status }) => 
    status === 'running' ? '#ff9800' :
    status === 'success' ? '#4caf50' : 
    '#f44336'};
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
`;

export const Button = styled.button`
  padding: 10px 20px;
  margin-right: 10px;
  background-color: #1e99d6;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #1e99d6 ;
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

export const ProgressBar = styled(BPProgressBar)`
  margin-top: 20px;
    width: 100%;
  height: 20px;
  background-color: #f4f4f4;
  border: 1px solid #ccc;
`;

export const Select = styled.select`
  margin-bottom: 20px;
  padding: 10px;
  border-radius: 5px;
  border: 1px solid #ddd;
  font-size: 16px;
`;

export const Option = styled.option`
  font-size: 16px;
`;

export const TabButton = styled.button<{ active: boolean }>`
  background-color: ${(props: { active: any; }) => (props.active ? '#1e99d6' : 'inherit')};
  border: none;
  outline: none;
  cursor: pointer;
  padding: 10px 20px;
  font-size: 16px;
  color: 1e99d6;
  transition: background-color 0.3s;
  width: 100%;
  text-align: left;
  margin-bottom: 10px;

  &:hover {
    background-color: #1e99d6;
  }
`;
export const TableHeader = styled.th`
  margin-bottom: 20px;
  border: 1px solid #1e99d6;
  padding: 8px;
  text-align: left;
  background-color: #1e99d6;
  color: white;
`;

export const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: #1e99d6;
  & th, & td {
    padding: 15px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
`;

export const TableCell = styled.td`
  border: 1px solid #ddd;
  padding: 8px;
`;

// Status-specific styles
export const StatusCell = styled(TableCell)<{ status: string }>`
  color: ${({ status }) => (status === 'Passed' ? 'green' : status === 'Failed' ? 'red' : 'inherit')};
  font-weight: bold;
`;



export const StyledLink = styled.a`
  color: #4CAF50;
  text-decoration: none;
  margin-right: 15px;

  &:hover {
    text-decoration: underline;
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

  export const ProgressMessage = styled.div`
  margin-top: 5px;
  font-size: 14px;
`;

