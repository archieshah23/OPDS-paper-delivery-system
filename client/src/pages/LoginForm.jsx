import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../design/login.css";
import { Captcha } from "./Captch";
export const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("verified") === "true") {
      alert("your email has been verified you can  now login");
    }
  }, [location]);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (captchaInput.trim() !== captchaText) {
      alert("invalid captcha try again!!");
      return;
    }
    const loginData = {
      email,
      password,
    };
    try {
      const response = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });
      const data = await response.json();

      if (response.ok) {
        alert("Login successful");
        sessionStorage.setItem("user", JSON.stringify(data.user));
        const userRole = data.user.role_id;
        switch (userRole) {
          case 1:
            navigate("/admin");
            break;
          case 2:
            navigate("/supervisor");
            break;
          case 3:
            navigate("/clg-dean");
            break;
          case 4:
            navigate("/clg-admin");
            break;
          default:
            alert("unknown role");
        }
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("error", error);
      alert("something went wrong");
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <div className="card">
          <h1>Login Form</h1>
          <form onSubmit={handleFormSubmit}>
            <div>
              <label htmlFor="email">EmailId: </label>
              <input
                type="email"
                name="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <label htmlFor="password">Password: </label>
              <input
                type="password"
                name="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>

            <div>
              <Captcha onTextChange={setCaptchaText} />
              <input
                className="input-error"
                type="text"
                placeholder="Enter the text shown in the image"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>

            {/* <p style={{ marginLeft: "350px" }}>
            No account?
            <Link to="/" style={{ color: "blue" }}>
              signup
            </Link>
          </p> */}
            <div className="login-footer">
              <span>No account?</span>
              <Link to="/">signup</Link>
            </div>

            <button type="submit" className="login-btn">
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
