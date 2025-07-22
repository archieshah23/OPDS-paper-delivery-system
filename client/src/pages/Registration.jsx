import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../design/register.css";
import { Captcha } from "./Captch";

export const Registration = () => {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [category, setCategory] = useState("");
  const [college, setCollege] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [collegeList, setCollegeList] = useState([]);
  const [phone, setPhone] = useState("");
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const navigate = useNavigate();

  const handleInputchange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "firstname":
        setFirstname(value);
        break;
      case "lastname":
        setLastname(value);
        break;
      case "email":
        setEmail(value);
        break;

      case "phone":
        setPhone(value);
        if (value === "") {
          setPhoneError("");
        } else {
          const isValidPhone = /^[6-9]\d{9}$/.test(value);
          setPhoneError(
            isValidPhone
              ? ""
              : "Please enter a valid 10-digit phone number (first number must be 6,7,8,9)"
          );
        }
        break;

      case "password":
        setPassword(value);
        const isValid = /^(?=.*[A-Z])(?=.*\d).{6,}$/.test(value);
        setPasswordError(
          isValid
            ? "strong password"
            : "Password must be at least 6 characters, include 1 uppercase letter and 1 number"
        );
        break;

      case "category":
        setCategory(value);
        break;
      case "college":
        setCollege(value);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (localStorage.getItem("emailVerified") === "true") {
        alert("Email verified successfully! You can now log in.");
        localStorage.removeItem("emailVerified");
        navigate("/login");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/colleges");
        const data = await response.json();
        if (response.ok) {
          setCollegeList(data.colleges);
        } else {
          console.error("server error", data.message);
        }
      } catch (error) {
        console.error("Failed to fetch colleges", error);
      }
    };
    fetchColleges();
  }, []);

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    if (captchaInput.trim() !== captchaText) {
      alert("invalid captcha try again!!");
      return;
    }
    const formData = {
      firstname,
      lastname,
      email,
      phone,
      password,
      category,
      college,
    };
    if (
      (category === "College dean" || category === "College admin") &&
      !college
    ) {
      alert("Please select a college.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/register-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        if (data.emailSent) {
          alert("Verification email sent. Please check your inbox.");
          navigate("/login");
        }
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("server error");
    }
  };

  return (
    <div className="register-page">
      <form onSubmit={handleFormSubmit}>
        <div className="container">
          <h1>Register</h1>

          <div>
            <label htmlFor="firstname">
              <b>First Name:</b>
            </label>
            <input
              type="text"
              name="firstname"
              placeholder="Enter First name"
              value={firstname}
              onChange={handleInputchange}
              required
            />
          </div>

          <div>
            <label htmlFor="lastname">
              <b>Last Name:</b>
            </label>
            <input
              type="text"
              name="lastname"
              placeholder="Enter Last name"
              value={lastname}
              onChange={handleInputchange}
              required
            />
          </div>

          <div>
            <label htmlFor="email">
              <b>Email:</b>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter Email"
              value={email}
              onChange={handleInputchange}
              required
            />
          </div>

          <div>
            <label htmlFor="phone">
              <b>Contact Number:</b>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="Enter 10-digit contact number"
              value={phone}
              onChange={handleInputchange}
              required
            />
            {phoneError && (
              <p style={{ color: "red", fontSize: "12px", marginTop: "-10px" }}>
                {phoneError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="password">
              <b>Password:</b>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter 6 letter Password"
              value={password}
              onChange={handleInputchange}
              required
            />
            {passwordError && (
              <p style={{ color: "red", fontSize: "12px", marginTop: "-10px" }}>
                {passwordError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="category">
              <b>Category:</b>
            </label>
            <select
              name="category"
              value={category}
              onChange={handleInputchange}
              required
              style={{ marginBottom: "20px", color: "grey" }}
            >
              <option value="">Select category</option>
              <option value="College dean">College dean</option>
              <option value="College admin">College admin</option>
              <option value="Supervisor">Supervisor</option>
              <option value="Admin">Admin</option>
            </select>
            {(category === "College dean" || category === "College admin") && (
              <>
                <label htmlFor="college">
                  <b>College Name:</b>
                </label>
                <select
                  name="college"
                  value={college}
                  onChange={handleInputchange}
                  style={{ color: "grey" }}
                >
                  <option value="">Select college</option>
                  {collegeList.map((clg) => (
                    <option key={clg.id} value={clg.name}>
                      {clg.name}
                    </option>
                  ))}
                </select>
              </>
            )}
          </div>

          <div>
            <label>
              <b>Captcha:</b>
            </label>
            <div className="captcha-inline-group">
              <Captcha onTextChange={setCaptchaText} />
              <input
                className="input-error"
                type="text"
                placeholder="Enter text shown in the image"
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
                style={{ flex: "1" }}
              />
            </div>
          </div>

          <p style={{ marginLeft: "180px", marginTop: "20px", color: "grey" }}>
            College not registered?{" "}
            <Link to="/college-register" style={{ color: "blue" }}>
              register here
            </Link>
          </p>
          <p style={{ marginLeft: "280px", marginTop: "20px", color: "grey" }}>
            Already Registered!{" "}
            <Link to="/login" style={{ color: "blue" }}>
              login
            </Link>
          </p>

          <div className="clearfix">
            <button
              type="submit"
              className="btn"
              // disabled={passwordError !== "strong password"}
            >
              Sign UP
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
