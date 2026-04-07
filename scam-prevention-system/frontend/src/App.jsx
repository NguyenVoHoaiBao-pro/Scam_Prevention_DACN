import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Import các file giao diện của bạn
import Login from "./pages/Login";
import Report from "./pages/scamReport";
import ScanContent from "./pages/ScanContent";

function App() {
    return (
        // BẮT BUỘC PHẢI CÓ THẺ ROUTER NÀY BAO BỌC Ở NGOÀI CÙNG
        <Router>
            <Routes>
                {/* Mặc định vào trang web sẽ nhảy sang /report */}
                <Route path="/" element={<Navigate to="/report" replace />} />

                {/* Khai báo các đường dẫn */}
                <Route path="/report" element={<Report />} />
                <Route path="/scan" element={<ScanContent />} />
                <Route path="/login" element={<Login />} />

                {/* Bắt lỗi gõ link bậy */}
                <Route path="*" element={<Navigate to="/report" replace />} />
            </Routes>
        </Router>
    );
}

export default App;