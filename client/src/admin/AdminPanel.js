import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./admin.css";
import { API as BASE_API } from "../api";   // ✅ ADDED

function AdminPanel() {

  const navigate = useNavigate();
  //const [fraudData, setFraudData] = useState([]);
  const [teams, setTeams] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    eliminatedUsers: 0,
    currentRound: 1,
    round1Locked: true,
    round2Locked: true,
    round3Locked: true
  });

  const [page, setPage] = useState(1);

  /* ===== BASE URL (Proxy OR ENV) ===== */
  const API = process.env.REACT_APP_API_URL || BASE_API;   // ✅ UPDATED

  /* ================= LIVE SSE ================= */

  useEffect(() => {
    const eventSource = new EventSource(
      `${API}/api/admin/live`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);

      const sorted = [...data.users].sort(
        (a, b) => b.total - a.total
      );

      setTeams(sorted);
      setStats(data.stats);
    };

    return () => eventSource.close();
  }, [API]);

  /* ================= PAGINATION ================= */

  const teamsPerPage = 50;
  const totalPages = Math.ceil(teams.length / teamsPerPage);

  const paginated = teams.slice(
    (page - 1) * teamsPerPage,
    page * teamsPerPage
  );

  /* ================= AUTO ELIMINATION ================= */

  const autoEliminate = async () => {
    try {
      const res = await fetch(
        `${API}/api/admin/auto-eliminate`,
        { method: "POST" }
      );

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Auto elimination failed");
        return;
      }

      alert("🔥 Bottom 30% Eliminated Successfully");

    } catch (err) {
      console.error("AutoEliminate Error:", err);
      alert("Error occurred during elimination");
    }
  };

  /* ================= CHANGE ROUND ================= */

  const changeRound = async (roundNumber) => {
    await fetch(
      `${API}/api/admin/round`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentRound: roundNumber })
      }
    );
  };

  /* ================= LOCK ROUND ================= */

  const lockRound = async (roundNumber) => {
    await fetch(
      `${API}/api/admin/lock-round`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundNumber })
      }
    );
  };

  /* ================= UNLOCK ROUND ================= */

  const unlockRound = async (roundNumber) => {
    await fetch(
      `${API}/api/admin/unlock-round`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roundNumber })
      }
    );
  };

  /* ================= FULL RESET ================= */

  const handleFullReset = async () => {
    const confirmReset = window.confirm(
      "⚠ This will reset ALL scores, eliminations and round.\nContinue?"
    );

    if (!confirmReset) return;

    try {
      const res = await fetch(
        `${API}/api/admin/full-reset`,
        { method: "POST" }
      );

      if (!res.ok) {
        const text = await res.text();
        alert("Reset failed: " + text);
        return;
      }

      alert("🔥 Competition Reset Successfully");

    } catch (error) {
      alert("Reset failed: " + error.message);
    }
  };

  useEffect(() => {
    fetch(`${API}/api/admin/fraud-report`)
      .then(res => res.json())
      .then(setFraudData);
  }, [API]);

  /* ================= UI ================= */

  return (
    <div className="admin-container">

      {/* HEADER */}
      <div className="admin-header">
        <div>
          <h1>🛡 Admin Control Panel</h1>
          <p>
            Code Fault Competition · Total Teams: {stats.totalUsers}
          </p>
        </div>

        <div className="header-actions">
          <button
            className="logout-btn"
            onClick={() => navigate("/")}
          >
            Logout
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="stat-card blue">
          <h2>{stats.totalUsers}</h2>
          <p>Total Teams</p>
        </div>

        <div className="stat-card green">
          <h2>{stats.activeUsers}</h2>
          <p>Active</p>
        </div>

        <div className="stat-card yellow">
          <h2>{stats.totalUsers}</h2>
          <p>PIN Mapped</p>
        </div>

        <div className="stat-card purple">
          <h2>{stats.currentRound}</h2>
          <p>Current Round</p>
        </div>

        <div className="stat-card cyan">
          <h2>{stats.eliminatedUsers}</h2>
          <p>Eliminated</p>
        </div>

        <div className="stat-card pink">
          <h2>{totalPages}</h2>
          <p>Total Pages</p>
        </div>

      </div>

      {/* ROUND MANAGEMENT */}
      <div className="panel">
        <h2>🔓 Team Management & Round Unlock</h2>

        <div className="round-buttons">

          {[1, 2, 3].map((round) => {

            const isLocked =
              round === 1 ? stats.round1Locked :
              round === 2 ? stats.round2Locked :
              stats.round3Locked;

            return (
              <div key={round} style={{ marginBottom: "10px" }}>

                <button
                  className={`round ${stats.currentRound === round ? "active" : ""}`}
                  onClick={() => changeRound(round)}
                >
                  Round {round}
                </button>

                {isLocked ? (
                  <button
                    className="unlock-btn"
                    onClick={() => unlockRound(round)}
                    style={{ marginLeft: "10px" }}
                  >
                    🔓 Unlock
                  </button>
                ) : (
                  <button
                    className="lock-btn"
                    onClick={() => lockRound(round)}
                    style={{ marginLeft: "10px" }}
                  >
                    🔒 Lock
                  </button>
                )}

              </div>
            );
          })}

        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            className="auto-btn"
            onClick={autoEliminate}
          >
            🔥 Auto Eliminate Bottom 30%
          </button>

          <button
            className="reset-btn"
            onClick={handleFullReset}
            style={{ marginLeft: "15px" }}
          >
            🚨 Full Competition Reset
          </button>
        </div>

      </div>

      {/* TEAM LIST */}
      <div className="panel">
        <h2>Teams (Live)</h2>

        <div className="team-list">
          {paginated.map((team, index) => (
            <div key={team._id} className="team-row">
              <div>
                <strong>
                  #{(page - 1) * teamsPerPage + index + 1} {team.name}
                </strong>

                <span className="pin">
                  PIN: {team.pin}
                </span>

                <span className="total">
                  Total: {team.total}
                </span>

                {(team.similarityFlag ||
                  team.aiGeneratedFlag ||
                  team.copyPasteFlag) && (
                  <span className="fraud">
                    ⚠ Fraud Flag
                  </span>
                )}
              </div>

              <div
                className={
                  team.eliminated
                    ? "mapped eliminated"
                    : "mapped"
                }
              >
                {team.eliminated
                  ? "Eliminated"
                  : "Active"}
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="pagination">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>

          <span>
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* BOTTOM CARDS */}
      <div className="bottom-grid">

        <div
          className="bottom-card"
          onClick={() => navigate("/admin")}
        >
          👥 View Teams
        </div>

        <div
          className="bottom-card"
          onClick={() => navigate("/leaderboard")}
        >
          🏆 Leaderboards
        </div>

        <div
          className="bottom-card"
          onClick={() => navigate("/cheat-monitor")}
        >
          ⚠ Cheat Monitor
        </div>

        <div
          className="bottom-card"
          onClick={() => navigate("/config")}
        >
          ⚙ Configuration
        </div>

      </div>

    </div>
  );
}

export default AdminPanel;
