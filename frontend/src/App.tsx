import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { StatisticsPageWrapper } from './pages/StatisticsPageWrapper';

function App(): React.JSX.Element {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/statistics" element={<StatisticsPageWrapper />} />
      </Routes>
    </Router>
  );
}

export default App;
