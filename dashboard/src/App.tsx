import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {InboxPage} from './pages/InboxPage';
import {AnalysisPage} from './pages/AnalysisPage';
import {ReputationPage} from './pages/ReputationPage';
import {WalletConnect} from './components/WalletConnect';

const App = () => {
  return (
    <Router>
      
        <Routes>
          <Route path="/" element={<InboxPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/reputation" element={<ReputationPage />} />
        </Routes>
     
    </Router>
  );
};

export default App;
