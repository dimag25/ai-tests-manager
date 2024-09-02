import React from 'react';
import { SidebarContainer, TabButton } from './styles';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <SidebarContainer>
      <TabButton
        active={activeTab === 'Generate'}
        onClick={() => setActiveTab('Generate')}
      >
        Generate Test
      </TabButton>
      <TabButton
        active={activeTab === 'RunTests'}
        onClick={() => setActiveTab('RunTests')}
      >
        Run Tests
      </TabButton>
      <TabButton
        active={activeTab === 'About'}
        onClick={() => setActiveTab('About')}
      >
        About
      </TabButton>
      <TabButton
        active={activeTab === 'Guide'}
        onClick={() => setActiveTab('Guide')}
      >
        Guide
      </TabButton>
    </SidebarContainer>
  );
};

export default Sidebar;