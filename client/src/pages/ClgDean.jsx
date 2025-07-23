import { useEffect, useState } from "react";
import "../design/clg.css";
import { OtpVerification } from "./OtpVerification";

export const ClgDean = () => {
  const user = JSON.parse(sessionStorage.getItem("user"));
  const [otp, setOtp] = useState(new Array(4).fill(""));
  // const [serverOtp, setServerOtp] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [college, setCollege] = useState(null);
  const [documents, setDocuments] = useState([]);

  const collegeId = user?.college_id;
  const email = user?.email || "";

  const handleGetOtp = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert("OTP sent to your email.");
      } else {
        alert("Failed to send OTP.");
      }
    } catch (err) {
      console.error("Error sending OTP:", err);
      alert("Something went wrong.");
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const enteredOtp = otp.join("");

    try {
      const res = await fetch("http://localhost:3000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: enteredOtp }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUnlocked(true);
      } else {
        alert("Incorrect OTP");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      alert("Something went wrong.");
    }
  };
  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/colleges");
        const data = await response.json();
        if (response.ok) {
          const foundCollege = data.colleges.find((c) => c.id === collegeId);
          setCollege(foundCollege);
        } else {
          console.error("Fetch college error:", data.message);
        }
      } catch (err) {
        console.error("Error fetching colleges:", err);
      }
    };
    if (collegeId) fetchCollege();
  }, [collegeId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/documents-with-subjects?collegeId=${collegeId}`
        );
        const data = await res.json();
        if (res.ok && data.files) {
          const filtered = data.files.filter(
            (doc) => doc.college_id === collegeId
          );
          setDocuments(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
    };

    if (unlocked && collegeId) {
      fetchDocuments();
    }
  }, [unlocked, collegeId]);

  if (!user) {
    return <p>User session not found. Please login again.</p>;
  }

  return (
    <div className="clg-dean-page">
      {!unlocked ? (
        <form onSubmit={handleSubmit}>
          <h2 className="header">College Dean Panel</h2>
          <h2 className="clg-name">
            College name: {college ? college.name : "Loading..."}
          </h2>

          <OtpVerification otpValue={otp} setOtpValue={setOtp} />

          <div className="button-clg">
            <button type="button" onClick={handleGetOtp}>
              Get OTP
            </button>
            <button type="submit" disabled={otp.includes("")}>
              Unlock
            </button>
          </div>
        </form>
      ) : (
        <div className="documents-section">
          <h2>Uploaded subject papers</h2>
          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <ul className="documents">
              {documents.map((doc, idx) => (
                <li key={idx}>
                  <strong>{doc.subject_name}</strong> ({doc.college_name} -{" "}
                  {doc.course_name} - {doc.semester_name})
                  <br />
                  <button>
                    <a
                      href={`http://localhost:3000/uploads/${doc.file_name}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {doc.file_name}
                    </a>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
