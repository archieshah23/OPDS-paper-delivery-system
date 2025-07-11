import { useEffect, useState } from "react";
import { FiUpload } from "react-icons/fi";
import "../design/supervisor.css";

export const Supervisor = () => {
  const [examData, setExamdata] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/colleges")
      .then((res) => res.json())
      .then((data) => {
        const formated = data.colleges.map((college) => ({
          college: college.name,
          courses: college.courses.map((course) => ({
            name: course.name,
            semesters: course.semesters.map((sem) => ({
              name: sem.name,
              subjects: sem.subjects || [],
            })),
          })),
        }));
        setExamdata(formated);
      })
      .catch((err) => {
        console.error("fail to fetch the data");
      });
  }, []);

  return (
    <div className="sup">
      <div className="sup-container">
        <h2>College Exam Date</h2>

        {examData.map((college, cIdx) => (
          <div key={cIdx} className="college-section">
            <div className="college-header">
              <span className="subject-dot" />
              <span className="college-name">
                <h4>{college.college.toUpperCase()}</h4>
              </span>
            </div>

            {college.courses.map((course, crIdx) => (
              <div key={crIdx} className="course-block">
                <div className="course-name">{course.name}</div>

                {course.semesters.map((sem, sIdx) => (
                  <div key={sIdx} className="semester-block">
                    <div
                      className="semester-name"
                      style={{ fontWeight: "bold" }}
                    >
                      {sem.name}
                    </div>
                    {sem.subjects.map((subj, subIdx) => (
                      <div key={subIdx} className="subject-row">
                        <div className="subject-info">
                          {subj.name} - {subj.date}
                        </div>
                        <input
                          type="file"
                          id={`file-${cIdx}-${crIdx}-${sIdx}-${subIdx}`}
                          style={{ display: "none" }}
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file && window.confirm("Submit this file?")) {
                              const formData = new FormData();
                              formData.append("file", file);
                              formData.append("subjectId", subj.id);

                              fetch("http://localhost:3000/upload", {
                                method: "POST",
                                body: formData,
                              })
                                .then((res) => {
                                  if (!res.ok) throw new Error("Upload failed");
                                  return res.json();
                                })
                                .then(() => alert("Uploaded successfully"))
                                .catch((err) => {
                                  alert("Upload failed");
                                  console.error(err);
                                });
                            }
                          }}
                        />
                        <button
                          className="upload-btn"
                          onClick={() =>
                            document
                              .getElementById(
                                `file-${cIdx}-${crIdx}-${sIdx}-${subIdx}`
                              )
                              .click()
                          }
                        >
                          <FiUpload className="upload-icon" />
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
