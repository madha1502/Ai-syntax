import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import AdminPanel from "./admin/AdminPanel";
import Leaderboard from "./pages/Leaderboard";

import Round1 from "./pages/Round1";
import Round2 from "./pages/Round2";
import Round3 from "./pages/Round3";
import Result from "./pages/Result";

/* 🔥 OPTIONAL: 404 Page */
function NotFound() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>404 😭 Page Not Found</h1>
      <p>Route path wrong da 🤡</p>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>

        {/* ===== LOGIN ===== */}
        <Route path="/" element={<LoginPage />} />

        {/* ===== ADMIN ===== */}
        <Route path="/admin" element={<AdminPanel />} />

        {/* ===== ROUNDS ===== */}
        <Route path="/round1" element={<Round1 />} />
        <Route path="/round2" element={<Round2 />} />
        <Route path="/round3" element={<Round3 />} />

        {/* ===== RESULTS ===== */}
        <Route path="/result" element={<Result />} />
        <Route path="/leaderboard" element={<Leaderboard />} />

        {/* ===== FALLBACK ===== */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

export default App;
