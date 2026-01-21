import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Vessels from './pages/Vessels';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/vessels" element={<Vessels />} />
        <Route path="/vessels/:id" element={<Vessels />} />
        <Route path="/decks" element={<Dashboard />} /> {/* Temporarily point to Dashboard as placeholder */}
        <Route path="/materials" element={<Dashboard />} />
        <Route path="/purchase-orders" element={<Dashboard />} />
        <Route path="/administration" element={<Dashboard />} />
        <Route path="/security" element={<Dashboard />} />
        <Route path="/master-data" element={<Dashboard />} />
        <Route path="/inventory" element={<Dashboard />} />
        <Route path="/contact" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
