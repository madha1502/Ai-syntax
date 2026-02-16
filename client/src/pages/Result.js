import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API as BASE_API } from "../api";   // ✅ ADDED

function Result() {
  const navigate = useNavigate();

  const [prompt, setPrompt] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ===== BASE URL (Proxy OR ENV) =====
  const API = process.env.REACT_APP_API_URL || BASE_API;   // ✅ UPDATED

  /* ================= IMAGE SELECT ================= */

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  };

  /* ================= SUBMIT ================= */

  const upload = async () => {
    try {
      const teamId = localStorage.getItem("teamId");

      if (!teamId) {
        alert("Login required");
        return;
      }

      if (!prompt.trim()) {
        alert("Please enter your prompt");
        return;
      }

      if (!imageFile) {
        alert("Please upload an image");
        return;
      }

      if (submitted) {
        alert("Already submitted!");
        return;
      }

      setLoading(true);

      // ⚠ TEMP image storage (only filename)
      const imageUrl = imageFile.name;

      const res = await fetch(
        `${API}/api/submission/submit`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            teamId,
            prompt,
            round: 1,
            imageUrl
          })
        }
      );

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        alert(data.error || "Upload failed");
        return;
      }

      setSubmitted(true);
      alert("✅ Submission Uploaded Successfully!");

    } catch (err) {
      console.error(err);
      setLoading(false);
      alert("Server error");
    }
  };

  /* ================= NEXT ROUND ================= */

  const goNext = () => {
    if (!submitted) {
      alert("Submit first before going to next round!");
      return;
    }

    navigate("/round2");
  };

  /* ================= UI ================= */

  return (
    <div style={styles.container}>

      <h1 style={styles.title}>UPLOAD YOUR SUBMISSION</h1>

      <textarea
        placeholder="Enter your Gemini prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        style={styles.textarea}
      />

      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={styles.input}
      />

      {preview && (
        <img src={preview} alt="Preview" style={styles.preview} />
      )}

      <div style={styles.buttonGroup}>

        <button style={styles.button} onClick={upload}>
          ⬆ Submit
        </button>

        <button style={styles.button} onClick={goNext}>
          ➡ Next Round
        </button>

      </div>

      {loading && <div style={styles.loader}></div>}

    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    margin: 0,
    background: "black",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    gap: "25px",
    color: "white",
    fontFamily: "Arial, sans-serif"
  },

  title: {
    color: "red",
    textShadow: "0 0 20px red"
  },

  textarea: {
    width: "420px",
    height: "130px",
    background: "black",
    color: "white",
    border: "2px solid red",
    borderRadius: "12px",
    padding: "12px",
    boxShadow: "0 0 20px red"
  },

  input: {
    color: "white"
  },

  preview: {
    width: "300px",
    borderRadius: "15px",
    boxShadow: "0 0 30px red"
  },

  buttonGroup: {
    display: "flex",
    gap: "20px"
  },

  button: {
    padding: "12px 28px",
    fontSize: "15px",
    color: "white",
    background: "transparent",
    border: "2px solid red",
    borderRadius: "10px",
    cursor: "pointer",
    boxShadow: "0 0 20px red"
  },

  loader: {
    width: "50px",
    height: "50px",
    border: "5px solid rgba(255,0,0,0.2)",
    borderTop: "5px solid red",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  }
};

export default Result;
