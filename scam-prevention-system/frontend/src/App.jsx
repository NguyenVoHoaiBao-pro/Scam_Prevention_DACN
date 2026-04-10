<<<<<<< HEAD
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
=======
import { Routes, Route, Navigate } from 'react-router-dom';
>>>>>>> 4568eb6644fc05d8fb326ee016d93185daecedd0
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Awareness from './pages/Awareness';
import ScamReport from './pages/scamReport';
<<<<<<< HEAD
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
=======
import ScanContent from './pages/ScanContent';

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/scan" element={<ScanContent />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/scam-report" element={<ScamReport />} />
      <Route path="/awareness" element={<Awareness />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
>>>>>>> 4568eb6644fc05d8fb326ee016d93185daecedd0
  );
}

export default App;