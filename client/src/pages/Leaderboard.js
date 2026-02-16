import React, { useEffect, useState } from "react";
import { API } from "../api";   // ✅ ADDED

function Leaderboard() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    const apiUrl =
      process.env.REACT_APP_API_URL || API;   // ✅ UPDATED

    const eventSource = new EventSource(
      `${apiUrl}/api/leaderboard/live`
    );

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setTeams(data);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>🏆 Live Leaderboard</h1>

      {teams.map((team, index) => (
        <div
          key={team._id}
          style={{
            ...cardStyle,
            background:
              index === 0
                ? "#FFD700"
                : index === 1
                ? "#C0C0C0"
                : index === 2
                ? "#CD7F32"
                : "#1f2937",
            color: index < 3 ? "black" : "white"
          }}
        >
          <span>#{index + 1}</span>
          <span>{team.teamId}</span>
          <span>{team.total} pts</span>
        </div>
      ))}
    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  padding: "40px",
  background: "#0f172a",
  color: "white"
};

const titleStyle = {
  marginBottom: "20px"
};

const cardStyle = {
  display: "flex",
  justifyContent: "space-between",
  padding: "12px 20px",
  marginBottom: "10px",
  borderRadius: "8px",
  fontWeight: "bold"
};

export default Leaderboard;
