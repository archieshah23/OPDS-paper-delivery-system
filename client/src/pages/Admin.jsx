import { useEffect, useState } from "react";
import "../design/admin.css";

export const Admin = () => {
  const [colleges, setColleges] = useState([]);

  useEffect(() => {
    const fetchColleges = async () => {
      try {
        const response = await fetch("http://localhost:3000/api/colleges");
        const data = await response.json();
        if (response.ok) {
          setColleges(data.colleges);
        } else {
          console.error("server error", data.message);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchColleges();
  }, []);

  return (
    <div className="adminpage">
      <h1>Admin Panel</h1>
      {colleges.map((clg, idx) => (
        <div className="clg-card" key={idx}>
          <h2>{clg.name.toUpperCase()}</h2>
          <p>
            <strong>MAC Address:</strong> {clg.mac_address || "N/A"}
          </p>
          <div className="course-section">
            {clg.courses?.length > 0 ? (
              clg.courses.map((course, cIdx) => (
                <div key={cIdx} className="course-block">
                  <p>
                    <strong>Course:</strong> {course.name}
                  </p>
                  {course.semesters?.length > 0 ? (
                    course.semesters.map((sem, sIdx) => (
                      <div key={sIdx} className="sem-block">
                        <p>
                          <strong>Semesters:</strong>
                          {sem.name}
                        </p>
                        {sem.subjects?.length > 0 ? (
                          sem.subjects.map((sub, ssIdx) => (
                            <div key={ssIdx} className="sub-block">
                              <p>
                                <strong>Subjects:</strong>
                                {sub.name}
                              </p>
                            </div>
                          ))
                        ) : (
                          <p>No subject found</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No sem found</p>
                  )}
                </div>
              ))
            ) : (
              <p>No courses found</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
