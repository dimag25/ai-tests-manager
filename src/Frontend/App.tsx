import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import GenerateTest from './components/GenerateTest';
import RunTests from './components/RunTests';
import About from './components/about';
import Guide from './components/Guide';
import { AppContainer, Content } from './components/styles';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('Generate');

  return (
    <AppContainer>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <Content>
        {activeTab === 'Generate' && <GenerateTest />}
        {activeTab === 'RunTests' && <RunTests />}
        {activeTab === 'About' && <About />}
        {activeTab === 'Guide' && <Guide />}
      </Content>
    </AppContainer>
  );
};

export default App;