import { useEffect, useState } from "react";
import axios from "axios";

function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/dashboard-stats",
        {
          withCredentials: true
        }
      );

      setStats(response.data);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="container page-container">
      <div className="mb-4">
        <span className="badge bg-primary mb-3">
          Progress Overview
        </span>

        <h1 className="section-title">
          Dashboard
        </h1>

        <p className="text-muted">
          Track your IELTS practice performance and progress.
        </p>
      </div>

      {!stats ? (
        <div className="card p-4">
          <p className="mb-0">Loading dashboard...</p>
        </div>
      ) : (
        <>
          <div className="row">
            <div className="col-md-3 mb-4">
              <div className="card stat-card p-4 h-100">
                <p className="text-muted mb-1">Total Exams</p>
                <div className="stat-number">
                  {stats.totalExams}
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card stat-card p-4 h-100">
                <p className="text-muted mb-1">Average Band</p>
                <div className="stat-number">
                  {stats.averageScore}
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card stat-card p-4 h-100">
                <p className="text-muted mb-1">Best Band</p>
                <div className="stat-number">
                  {stats.bestScore}
                </div>
              </div>
            </div>

            <div className="col-md-3 mb-4">
              <div className="card stat-card p-4 h-100">
                <p className="text-muted mb-1">Latest Difficulty</p>
                <div className="stat-number text-capitalize">
                  {stats.latestDifficulty}
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 mt-3">
            <h4 className="section-title">
              Study Recommendation
            </h4>

            <p className="text-muted mb-0">
              Keep practicing regularly and review your exam history to see
              which IELTS skills need the most improvement.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;