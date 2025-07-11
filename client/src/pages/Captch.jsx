import { useEffect, useRef, useState } from "react";
import { TfiReload } from "react-icons/tfi";
export const Captcha = ({ onTextChange }) => {
  const canvasref = useRef(null);
  const [captchaText, setCaptchaText] = useState("");

  const generateCaptcha = () => {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let text = "";
    for (let i = 0; i < 6; i++) {
      text += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptchaText(text);
    onTextChange(text);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  useEffect(() => {
    const canvas = canvasref.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Georgia";
    ctx.fillStyle = "#000";

    for (let i = 0; i < 15; i++) {
      ctx.beginPath();
      ctx.arc(Math.random() * 120, Math.random() * 40, 1, 0, 2 * Math.PI);
      ctx.fill();
    }
    captchaText.split("").forEach((char, i) => {
      ctx.save();
      ctx.translate(10 + i * 18, 25);
      const angle = Math.random() * 0.4 - 0.2;
      ctx.rotate(angle);
      ctx.fillText(char, 0, 0);
      ctx.restore();
    });
  }, [captchaText]);
  return (
    <div style={{ textAlign: "center", marginBottom: "20px" }}>
      <canvas
        ref={canvasref}
        width="140"
        height="40"
        style={{
          border: "1px solid #ccc",
          borderRadius: "5px",
          margin: "10px",
          //   marginBottom: "0px",
        }}
      />
      <button
        type="button"
        onClick={generateCaptcha}
        style={{
          padding: "5px 12px",
          border: "none",
          borderRadius: "5px",
          display: "flex",
          cursor: "pointer",
          fontSize: "20px",
        }}
      >
        <TfiReload />
      </button>
    </div>
  );
};
