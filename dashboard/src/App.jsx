import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import DashboardHome from './pages/DashboardHome';
import DecisionTools from './pages/DecisionTools';
import Students from './pages/Students';
import Universities from './pages/Universities';
import Programs from './pages/Programs';
import Scholarships from './pages/Scholarships';
import Documents from './pages/Documents';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

export default function App() {
  return (
    <AppThemeProvider>
      <DataProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/tools" element={<DecisionTools />} />
            <Route path="/students" element={<Students />} />
            <Route path="/universities" element={<Universities />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/insights" element={<Insights />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </BrowserRouter>
      </DataProvider>
    </AppThemeProvider>
  );
}
