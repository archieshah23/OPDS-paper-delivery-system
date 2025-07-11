import { useEffect, useState } from "react";
import "../design/clg_admin.css";
export const ClgAdmin = () => {
  const [pin, setPin] = useState("");
  const [unlocked, setUnlocked] = useState(false);
  const [college, setCollege] = useState([]);
  const [documents, setDocuments] = useState([]);
  const correctPin = "5678";

  const user = JSON.parse(localStorage.getItem("user"));
  const collegeId = Number(user?.college_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === correctPin) {
      setUnlocked(true);
    } else {
      alert("Incorrect PIN");
    }
  };

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        // const res = await fetch(
        //   "http://localhost:3000/api/documents-with-subjects"
        // );
        const res = await fetch(
          `http://localhost:3000/api/documents-with-subjects?collegeId=${collegeId}`
        );

        const data = await res.json();

        if (res.ok && data.files) {
          const filteredDocs = data.files.filter(
            (doc) => doc.college_id === collegeId
          );
          setDocuments(filteredDocs);
        }
      } catch (error) {
        console.error("Failed to fetch documents", error);
      }
    };

    if (unlocked && collegeId) {
      fetchDocuments();
    }
  }, [unlocked, collegeId]);

  useEffect(() => {
    const fetchCollege = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/colleges");
        const data = await response.json();
        if (response.ok) {
          const thiscollege = data.colleges.find((c) => c.id === collegeId);
          setCollege(thiscollege);
        } else {
          console.error("Cant connect", data.message);
        }
      } catch (error) {
        console.error("Error", error);
      }
    };
    fetchCollege();
  }, [collegeId]);

  return (
    <div className="clg-admin-page">
      {!unlocked ? (
        <form onSubmit={handleSubmit}>
          <h2 className="header">College Admin Panel</h2>
          <h2 className="clg-name">
            College Name: {college ? college.name : "Loading.."}
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
          <h2>Uploaded Subject Papers</h2>
          {documents.length === 0 ? (
            <p>No documents uploaded yet.</p>
          ) : (
            <ul className="documents">
              {documents
                .filter((doc) => doc)
                .map((doc, idx) => (
                  <li key={idx}>
                    <strong>{doc.subject_name}</strong> ({doc.college_name} -{" "}
                    {doc.course_name} - {doc.semester_name})<br />
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
