import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/exam-history",
        {
          withCredentials: true
        }
      );

      setHistory(response.data);
    } catch (error) {
      console.log(error);
      alert("Failed to load exam history.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return "Unknown date";

    return new Date(dateValue).toLocaleString();
  };

  const getBandBadgeClass = (score) => {
    const band = Number(score);

    if (band >= 7) return "bg-success";
    if (band >= 5.5) return "bg-primary";
    if (band >= 4) return "bg-warning text-dark";

    return "bg-danger";
  };

  return (
    <div className="container page-container">
      <div className="mb-4">
        <span className="badge bg-primary mb-3">
          Exam Records
        </span>

        <h1 className="section-title">
          Exam History
        </h1>

        <p className="text-muted">
          Review your previous IELTS practice attempts, band scores, feedback,
          and difficulty levels.
        </p>
      </div>

      {loading && (
        <div className="card p-4">
          <p className="mb-0">Loading exam history...</p>
        </div>
      )}

      {!loading && history.length === 0 && (
        <div className="card p-5 text-center">
          <h4 className="section-title">
            No exam history yet
          </h4>

          <p className="text-muted">
            Complete your first IELTS practice exam to see your results here.
          </p>

          <Link to="/exam" className="btn btn-primary">
            Start Practice
          </Link>
        </div>
      )}

      {!loading && history.length > 0 && (
        <div className="row">
          {history.map((item, index) => (
            <div className="col-lg-6 mb-4" key={item.id || index}>
              <div className="card exam-card p-4 h-100">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="section-title mb-1">
                      Practice Exam #{history.length - index}
                    </h4>

                    <p className="text-muted mb-0">
                      {formatDate(item.created_at)}
                    </p>
                  </div>

                  <span className="badge bg-primary text-capitalize">
                    {item.difficulty || "Unknown"}
                  </span>
                </div>

                <div className="row text-center mb-3">
                  <div className="col-6 col-md-3 mb-3">
                    <p className="text-muted mb-1">
                      Reading
                    </p>

                    <span className={`badge ${getBandBadgeClass(item.reading)}`}>
                      {item.reading}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 mb-3">
                    <p className="text-muted mb-1">
                      Writing
                    </p>

                    <span className={`badge ${getBandBadgeClass(item.writing)}`}>
                      {item.writing}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 mb-3">
                    <p className="text-muted mb-1">
                      Listening
                    </p>

                    <span className={`badge ${getBandBadgeClass(item.listening)}`}>
                      {item.listening}
                    </span>
                  </div>

                  <div className="col-6 col-md-3 mb-3">
                    <p className="text-muted mb-1">
                      Speaking
                    </p>

                    <span className={`badge ${getBandBadgeClass(item.speaking)}`}>
                      {item.speaking}
                    </span>
                  </div>
                </div>

                <div className="card p-3 bg-light mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <strong>Overall Band</strong>

                    <span
                      className={`badge ${getBandBadgeClass(item.overall)}`}
                    >
                      {item.overall}
                    </span>
                  </div>
                </div>

                <div>
                  <h6>AI Feedback</h6>

                  <p className="text-muted mb-0">
                    {item.feedback || "No feedback available."}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;