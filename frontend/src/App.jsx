import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Leads from './pages/Leads';
import Properties from './pages/Properties';
import SiteVisits from './pages/SiteVisits';
import Pipeline from './pages/Pipeline';
import NegotiationCoach from './pages/NegotiationCoach';
import Finance from './pages/Finance';
import Partners from './pages/Partners';
import Team from './pages/Team';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/properties" element={<Properties />} />
        <Route path="/visits" element={<SiteVisits />} />
        <Route path="/pipeline" element={<Pipeline />} />
        <Route path="/coach" element={<NegotiationCoach />} />
        <Route path="/finance" element={<Finance />} />
        <Route path="/partners" element={<Partners />} />
        <Route path="/team" element={<Team />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
