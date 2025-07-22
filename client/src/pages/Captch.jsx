import { useEffect, useRef, useState } from "react";
import { TfiReload } from "react-icons/tfi";
import "../design/register.css";

export const Captcha = ({ onTextChange }) => {
  const canvasRef = useRef(null);
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
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "24px Arial";
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
    <div className="captcha-inline-group">
      <canvas
        ref={canvasRef}
        width="140"
        height="40"
        className="captcha-canvas"
      />
      <button
        type="button"
        onClick={generateCaptcha}
        className="captcha-refresh"
      >
        <TfiReload />
      </button>
    </div>
  );
};
