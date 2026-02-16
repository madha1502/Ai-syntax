import React, { useEffect, useRef, useState } from "react";
import "./Round1.css";
import { useNavigate } from "react-router-dom";

function Round1() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState("Loading...");
  const [roundLocked, setRoundLocked] = useState(true);

  // ===== BASE URL (Proxy OR ENV) =====
  const API = process.env.REACT_APP_API_URL || "";

  /* ================= PARTICLE BACKGROUND ================= */

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 1;
        this.speed = Math.random() * 0.4 + 0.2;
        this.opacity = Math.random();
      }

      update() {
        this.y -= this.speed;
        if (this.y < 0) {
          this.y = canvas.height;
          this.x = Math.random() * canvas.width;
        }
      }

      draw() {
        ctx.fillStyle = `rgba(255,40,40,${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 300; i++) {
      particles.push(new Particle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  /* ================= TIMER + ROUND STATUS ================= */

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${API}/api/round`);

        if (!res.ok) {
          setTimeLeft("Error");
          return;
        }

        const data = await res.json();

        setRoundLocked(data.round1Locked);

        if (data.roundEndTime) {
          const diff = new Date(data.roundEndTime) - new Date();

          if (diff <= 0) {
            setTimeLeft("00:00");
            return;
          }

          const minutes = Math.floor(diff / 60000);
          const seconds = Math.floor((diff % 60000) / 1000);

          setTimeLeft(
            `${minutes.toString().padStart(2, "0")}:` +
            `${seconds.toString().padStart(2, "0")}`
          );
        } else {
          setTimeLeft("--:--");
        }

      } catch (err) {
        setTimeLeft("Error");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [API]);

  /* ================= BUTTON ACTIONS ================= */

  const openGemini = () => {
    if (roundLocked) {
      alert("Round 1 is locked by Admin!");
      return;
    }

    window.open("https://chatgpt.com/", "_blank");
  };

  const goToUpload = () => {
    if (roundLocked) {
      alert("Round 1 is locked by Admin!");
      return;
    }

    navigate("/result");
  };

  /* ================= UI ================= */

  return (
    <div className="round1-container">

      <canvas ref={canvasRef}></canvas>

      <div className="title">ROUND 1</div>

      <div className="timer">
        ⏳ Time Left: {timeLeft}
      </div>

      <div className="tagline">
        THEME : STRANGER THINGS
      </div>

      <div className="prompt-box">

        <button
          className="login-btn"
          onClick={openGemini}
        >
          TYPE YOUR PROMPT
        </button>

        <button
          className="login-btn"
          style={{ marginTop: "20px" }}
          onClick={goToUpload}
        >
          UPLOAD
        </button>

      </div>

    </div>
  );
}

export default Round1;
