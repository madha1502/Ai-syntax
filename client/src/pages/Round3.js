import React, { useEffect, useRef, useState } from "react";
import "./Round3.css";
import { useNavigate } from "react-router-dom";
import { API as BASE_API } from "../api";   // ✅ ADDED

function Round3() {

  const canvasRef = useRef(null);
  const popupRef = useRef(null);
  const animationRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [roundLocked, setRoundLocked] = useState(true);
  const [uploaded, setUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);

  // ===== BASE URL (Proxy OR ENV) =====
  const API = process.env.REACT_APP_API_URL || BASE_API;   // ✅ UPDATED

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbx5ZzcRCr2VntmZ_F8h9jhccxguG8IVZWGIqDTp0MPqoRROwzbeZVToFUXJpYE97OeC/exec";

  /* ================= CHECK ROUND ================= */
  useEffect(() => {

    const fetchRound = () => {
      fetch(`${API}/api/round`)
        .then(r => r.json())
        .then(data => setRoundLocked(data.round3Locked))
        .catch(() => console.log("Backend not running 🤡"));
    };

    fetchRound();

    const interval = setInterval(fetchRound, 5000);
    return () => clearInterval(interval);

  }, [API]);

  /* ================= PARTICLES ================= */
  useEffect(() => {

    const canvas = canvasRef.current;
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
      }
      update() {
        this.y -= this.speed;
        if (this.y < 0) this.y = canvas.height;
      }
      draw() {
        ctx.fillStyle = "rgba(255,40,40,0.8)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < 300; i++)
      particles.push(new Particle());

    const animate = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationRef.current);

  }, []);

  const checkUpload = () => {
    if (!uploaded) {
      alert("Upload video pannitu va da 😭");
      return false;
    }
    return true;
  };

  const finalBlast = () => {
    if (!checkUpload()) return;
    popupRef.current.style.display = "flex";
  };

  const goResult = () => {

    if (!checkUpload()) return;

    launchConfetti();

    setTimeout(() => {
      navigate("/leaderboard");
    }, 2000);
  };

  const uploadVideo = () => {

    if (roundLocked)
      return alert("Round 3 locked da 😭");

    if (uploading)
      return alert("Uploading already da 🤡 wait!");

    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("video/"))
      return alert("Video mattum upload pannuda 🤡");

    setUploading(true);

    try {

      alert("Uploading to Drive... 😎");

      const reader = new FileReader();

      reader.onload = async function (event) {

        try {

          const base64File = event.target.result.split(",")[1];

          const formData = new FormData();
          formData.append("fileName", file.name);
          formData.append("mimeType", file.type);
          formData.append("data", base64File);

          const driveRes = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: formData
          });

          const driveData = await driveRes.json();

          if (!driveData.success || !driveData.fileUrl)
            throw new Error("Drive upload fail 😭");

          const driveLink = driveData.fileUrl;
          console.log("Drive Link:", driveLink);

          const teamId = localStorage.getItem("teamId");

          if (!teamId)
            throw new Error("Login pannala da 😭");

          const backendRes = await fetch(
            `${API}/api/submission/round3`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                teamId,
                fileUrl: driveLink
              })
            }
          );

          const backendData = await backendRes.json();

          if (!backendData.success)
            throw new Error(backendData.error);

          alert(`🔥 Uploaded Successfully\nScore: ${backendData.score}`);

          setUploaded(true);

        } catch (err) {
          alert("Upload failed 😭 " + err.message);
        } finally {
          setUploading(false);
        }

      };

      reader.readAsDataURL(file);

    } catch (err) {
      setUploading(false);
      alert("Upload failed 😭 " + err.message);
    }
  };

  const restartGame = () => {
    popupRef.current.style.display = "none";
    navigate("/round1");
  };

  const launchConfetti = () => {

    for (let i = 0; i < 120; i++) {

      const conf = document.createElement("div");
      conf.className = "confetti";

      conf.style.left = Math.random() * 100 + "vw";
      conf.style.top = "-20px";
      conf.style.background = `hsl(${Math.random()*360},100%,50%)`;
      conf.style.animationDuration = (Math.random()*2 + 2) + "s";

      document.body.appendChild(conf);

      setTimeout(() => conf.remove(), 4000);
    }
  };

  return (
    <div className="round3-container">

      <canvas ref={canvasRef}></canvas>

      <div className="logo">
        <div className="line"></div>
        <div className="title">ROUND 3</div>
        <div className="line"></div>
      </div>

      <div className="logo1">
        <div className="tagline">THEME : STRANGER THINGS</div>
      </div>

      <button className="login-btn" onClick={finalBlast}>
        CLOSE THE PORTAL
      </button>

      <div className="btn-group">

        <button className="btn" onClick={uploadVideo} disabled={uploading}>
          {uploading ? "Uploading..." : "⬇ Upload Video"}
        </button>

        <button className="btn" onClick={goResult}>
          Result
        </button>

      </div>

      <input
        type="file"
        accept="video/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <div ref={popupRef} className="popup-overlay" style={{ display: "none" }}>
        <div className="popup-box">
          <h2>HAWKINS IS SAFE</h2>
          <p>You closed the Upside Down forever.</p>
          <button onClick={restartGame}>
            BACK TO HKINS
          </button>
        </div>
      </div>

    </div>
  );
}

export default Round3;
