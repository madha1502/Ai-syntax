import React, { useEffect, useRef, useState } from "react";
import "./Round2.css";
import { useNavigate } from "react-router-dom";
import logoLeft from "../assets/de1.png";
import logoRight from "../assets/dee1.png";
import { API as BASE_API } from "../api";   // ✅ ADDED

function Round2() {

  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const [roundLocked, setRoundLocked] = useState(true);
  const [popupVisible, setPopupVisible] = useState(false);
  const [popupTitle, setPopupTitle] = useState("");
  const [popupText, setPopupText] = useState("");
  const [uploading, setUploading] = useState(false);

  // ===== BASE URL (Proxy OR ENV) =====
  const API = process.env.REACT_APP_API_URL || BASE_API;   // ✅ UPDATED

  const GOOGLE_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbx5ZzcRCr2VntmZ_F8h9jhccxguG8IVZWGIqDTp0MPqoRROwzbeZVToFUXJpYE97OeC/exec";

  /* ================= CHECK ROUND ================= */
  useEffect(() => {
    fetch(`${API}/api/round`)
      .then(r => r.json())
      .then(data => {
        console.log("ROUND DATA:", data);
        setRoundLocked(data.round2Locked);
      })
      .catch(() => {
        alert("Server connect aagala da 🤡 Backend start pannuda!");
      });
  }, [API]);

  /* ================= AUTO REFRESH ROUND STATUS ================= */
  useEffect(() => {

    const interval = setInterval(() => {

      fetch(`${API}/api/round`)
        .then(r => r.json())
        .then(data => {
          console.log("🔄 Updated Round:", data);
          setRoundLocked(data.round2Locked);
        });

    }, 5000);

    return () => clearInterval(interval);

  }, [API]);

  /* ================= NEXT ROUND ================= */
  const goNextRound = async () => {
    try {
      const res = await fetch(`${API}/api/round`);
      const data = await res.json();

      if (data.currentRound < 3)
        return alert("Round 3 not started yet da 😭 Admin start pannattum");

      navigate("/round3");

    } catch {
      alert("Server error da 🤡");
    }
  };

  /* ================= UPLOAD BUTTON ================= */
  const upload = () => {
    if (roundLocked)
      return alert("Round 2 locked da 😭 Admin unlock pannunga");

    fileInputRef.current.click();
  };

  /* ================= FILE UPLOAD ================= */
  const handleFileChange = async (e) => {

    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("audio/"))
      return alert("MP3 mattum upload pannuda DJ 😂");

    setPopupVisible(true);
    setPopupTitle("Uploading...");
    setPopupText("Curse eating your music da 😈");
    setUploading(true);

    try {

      const reader = new FileReader();

      reader.onload = async function (event) {

        try {

          const base64File = event.target.result.split(",")[1];

          const formData = new FormData();
          formData.append("fileName", file.name);
          formData.append("mimeType", file.type);
          formData.append("data", base64File);

          console.log("Uploading to Drive...");

          const driveRes = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: formData
          });

          const driveData = await driveRes.json();
          console.log("Drive Response:", driveData);

          const driveLink =
            driveData.fileUrl ||
            driveData.url ||
            driveData.link;

          if (!driveLink || !driveLink.startsWith("http"))
            throw new Error("Apps Script file link kudukkala da 😭");

          console.log("Drive Link:", driveLink);

          const teamId = localStorage.getItem("teamId");

          if (!teamId)
            throw new Error("Login pannala da 😭");

          const backendRes = await fetch(
            `${API}/api/submission/submit`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ teamId, fileUrl: driveLink })
            }
          );

          const backendData = await backendRes.json();
          console.log("Backend Response:", backendData);

          if (!backendData.success)
            throw new Error(backendData.error || "Backend save fail 😭");

          setPopupTitle("🔥 Uploaded Successfully");
          setPopupText(`Score: ${backendData.score}\n${backendData.feedback}`);

        } catch (err) {
          console.error(err);
          setPopupTitle("Upload Failed ❌");
          setPopupText(err.message);
        } finally {
          setUploading(false);
        }
      };

      reader.readAsDataURL(file);

    } catch (err) {
      console.error(err);
      setPopupTitle("Upload Failed ❌");
      setPopupText(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="round2-container">

      <img src={logoLeft} className="college-logo1" alt="" />
      <img src={logoRight} className="college-logo" alt="" />

      <div className="title">ROUND 2</div>
      <div className="subtitle">
        Create the Track. Break the Curse
      </div>

      <div className="btn-group">

        <button className="btn" onClick={upload} disabled={uploading}>
          ⬇ Upload MP3
        </button>

        <button className="btn" onClick={goNextRound}>
          ➡ Next Round
        </button>

      </div>

      <div className="quote">
        "Only the best track survives the curse..."
      </div>

      <input
        type="file"
        accept="audio/*"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      {popupVisible && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h2>{popupTitle}</h2>
            <p>{popupText}</p>
            <button onClick={() => setPopupVisible(false)}>
              Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default Round2;
