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
    <div className="container mt-5">
      <h1>Dashboard</h1>

      {!stats ? (
        <p>Loading dashboard...</p>
      ) : (
        <div className="row mt-4">

          <div className="col-md-3 mb-3">
            <div className="card p-4 shadow-sm">
              <h5>Total Exams</h5>
              <h2>{stats.totalExams}</h2>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card p-4 shadow-sm">
              <h5>Average Band</h5>
              <h2>{stats.averageScore}</h2>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card p-4 shadow-sm">
              <h5>Best Band</h5>
              <h2>{stats.bestScore}</h2>
            </div>
          </div>

          <div className="col-md-3 mb-3">
            <div className="card p-4 shadow-sm">
              <h5>Latest Difficulty</h5>
              <h2>{stats.latestDifficulty}</h2>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Dashboard;