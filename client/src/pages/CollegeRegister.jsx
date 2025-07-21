import { useState } from "react";
import Select from "react-select";
import makeAnimated from "react-select/animated";
// import "../index.css";
import "../design/clg_register.css";
import { Captcha } from "./Captch";

export const CollegeRegister = () => {
  const [clgname, setClgname] = useState("");
  const [macadd, setMacadd] = useState("");
  const [courses, setCourses] = useState([]);
  const [captchaInput, setCaptchaInput] = useState("");
  const [captchaText, setCaptchaText] = useState("");
  const handleInputchange = (event) => {
    const { name, value } = event.target;
    switch (name) {
      case "clgname":
        setClgname(value);
        break;
      case "macadd":
        setMacadd(value);
        break;
      default:
        break;
    }
  };

  const handleCoursesChange = (selectedOptions) => {
    setCourses(selectedOptions);
  };

  const handleFormsubmit = async (event) => {
    event.preventDefault();
    if (captchaInput.trim() !== captchaText) {
      alert("invalid captcha please try again!!");
      return;
    }
    const clgdata = {
      clgname,
      macadd,
      courses: courses.map((course) => course.value),
    };

    try {
      const response = await fetch(
        "http://localhost:3000/api/register-college",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(clgdata),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("College registered successfully!");
        setClgname("");
        setMacadd("");
        setCourses([]);
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error registering college:", error);
      alert("Server error");
    }
  };

  const animatedComponents = makeAnimated();

  const courseOptions = [
    { value: "B.Tech", label: "B.Tech" },
    { value: "M.Tech", label: "M.Tech" },
    { value: "MBA", label: "MBA" },
    { value: "BBA", label: "BBA" },
    { value: "PhD", label: "PhD" },
  ];

  return (
    <div className="college-register-page">
      <div className="college-register-container">
        <form onSubmit={handleFormsubmit}>
          <h1>College Registration</h1>

          <label htmlFor="clgname">
            <b>College Name:</b>
          </label>
          <input
            type="text"
            name="clgname"
            placeholder="Enter college name"
            value={clgname}
            onChange={handleInputchange}
            required
          />

          <label htmlFor="macadd">
            <b>Mac Address:</b>
          </label>
          <input
            type="text"
            name="macadd"
            placeholder="Enter Mac address of college"
            value={macadd}
            onChange={handleInputchange}
            required
          />

          <label htmlFor="courses">
            <b>Courses:</b>
          </label>
          <div className="multi-option">
            <Select
              closeMenuOnSelect={false}
              components={animatedComponents}
              isMulti
              options={courseOptions}
              onChange={handleCoursesChange}
              placeholder="Select courses offered"
            />
          </div>

          <div>
            <Captcha onTextChange={setCaptchaText} />
            <input
              type="text"
              placeholder="Enter text shown in the image"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="college-register-btn">
            Register
          </button>
        </form>
      </div>
    </div>
  );
};
