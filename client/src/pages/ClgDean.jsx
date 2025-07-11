import { useEffect, useState } from "react";
import "../design/clg.css";
export const ClgDean = () => {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [college, setCollege] = useState([]);
  const [documents, setDocuments] = useState([]);
  const correctPin = "1234";

  const user = JSON.parse(sessionStorage.getItem("user"));
  const colllegeId = user?.college_id;
  // console.log(colllegeId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === correctPin) {
      setUnlocked(true);
    } else {
      alert("Incorrect PIN");
    }
  };
  useEffect(() => {
    const collegeData = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/colleges");
        const data = await response.json();
        if (response.ok) {
          const fetchId = data.colleges.find((c) => c.id === colllegeId);
          setCollege(fetchId);
        } else {
          console.error("Cant connect", data.message);
        }
      } catch (error) {
        console.error("error", error);
      }
    };
    collegeData();
  }, [colllegeId]);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/documents-with-subjects?collegeId=${colllegeId}`
        );
        const data = await res.json();
        console.log(data, colllegeId);
        if (res.ok && data.files) {
          const filterdocs = data.files.filter(
            (doc) => doc.college_id === colllegeId
          );
          setDocuments(filterdocs);
        }
      } catch (error) {
        console.error("failed to fetch documents", error);
      }
    };

    if (unlocked && colllegeId) {
      fetchDocument();
    }
  }, [unlocked, colllegeId]);

  return (
    <div className="clg-dean-page">
      {!unlocked ? (
        <form onSubmit={handleSubmit}>
          <h2 className="header">College Dean Panel</h2>
          <h2 className="clg-name">
            College name: {college ? college.name : "Loading..."}
          </h2>
          <input
            className="otp"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter 4-digit PIN"
            maxLength={4}
            required
          />
          <div className="button-clg">
            <button>Get OTP</button>
            <button type="submit" disabled={pin.length !== 4}>
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
              {documents
                .filter((doc) => doc)
                .map((doc, idx) => (
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
