import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import FloatingDock from './components/FloatingDock';
import Dashboard from './pages/Dashboard';
import ApplicationsList from './pages/ApplicationsList';
import NewApplication from './pages/NewApplication';
import ApplicationDetail from './pages/ApplicationDetail';
import DailyGoals from './pages/DailyGoals';
import ShortlistedPipeline from './pages/ShortlistedPipeline';

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/applications" element={<ApplicationsList />} />
          <Route path="/applications/new" element={<NewApplication />} />
          <Route path="/applications/:id" element={<ApplicationDetail />} />
          <Route path="/shortlisted" element={<ShortlistedPipeline />} />
          <Route path="/daily-goals" element={<DailyGoals />} />
        </Routes>
        <FloatingDock />
      </div>
    </BrowserRouter>
  );
}

export default App;
