import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Awareness from './pages/Awareness';
import ScamReport from './pages/scamReport';
import ScanContent from "./pages/ScanContent";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/scam-report" element={<ScamReport />} />
      <Route path="/scan" element={<ScanContent />} />
      <Route path="/awareness" element={<Awareness />} />
      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

