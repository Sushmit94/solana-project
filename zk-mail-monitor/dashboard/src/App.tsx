import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {InboxPage} from './pages/InboxPage';
import {AnalysisPage} from './pages/AnalysisPage';
import {ReputationPage} from './pages/ReputationPage';
import {WalletConnect} from './components/WalletConnect';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <WalletConnect />
        <Routes>
          <Route path="/" element={<InboxPage />} />
          <Route path="/analysis" element={<AnalysisPage />} />
          <Route path="/reputation" element={<ReputationPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
