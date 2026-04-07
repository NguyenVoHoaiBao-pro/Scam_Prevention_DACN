import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Register from "./pages/Register";
import HomePage from "./pages/HomePage";
import Awareness from './pages/Awareness';
import ScamReport from './pages/scamReport';

function App() {
  return (
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/scam-report" element={<ScamReport />} />
        <Route path="/awareness" element={<Awareness />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
  );
}

export default App;
/*

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import Report from "./pages/scamReport";
import Awareness from './pages/Awareness';
import Login from "./pages/Login";
function App() {
  return (
      <Routes>
       
       /* <Route path="/" element={<Login />} />
        
        
       /* <Route path="/report" element={<Report />} />
        <Route path="/awareness" element={<Awareness />} />

      </Routes>
  );
}
export default App;*/