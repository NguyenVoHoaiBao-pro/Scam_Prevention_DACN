/* eslint-disable react-hooks/set-state-in-effect */
/*
import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from "./pages/Login";
import Report from "./pages/scamReport";
import Awareness from './pages/Awareness'; 

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in from localStorage
    const authUser = localStorage.getItem("authUser");
    if (authUser) {
      
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("authUser");
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/report" element={<Report />} />
      <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login onLoginSuccess={handleLoginSuccess} />} />
      <Route path="/" element={isLoggedIn ? <Report onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/report" element={isLoggedIn ? <Report onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="/awareness" element={isLoggedIn ? <Awareness onLogout={handleLogout} /> : <Navigate to="/login" />} />
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/login"} />} />
    </Routes>
  );
}

export default App;
*/

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; 
import Report from "./pages/scamReport";
import Awareness from './pages/Awareness';
import Login from "./pages/Login";
function App() {
  return (
      <Routes>
        {/* Mặc định vào trang chủ (/) sẽ hiện trang Login */}
        <Route path="/" element={<Login />} />
        
        {/* Khi vào đường dẫn /report sẽ hiện trang Report */}
        <Route path="/report" element={<Report />} />
        <Route path="/awareness" element={<Awareness />} />

      </Routes>
  );
}
export default App;