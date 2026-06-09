import { useEffect, useState } from "react";
import axios from "axios";

function History() {
  const [history, setHistory] = useState([]);

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
    }
  };

  return (
    <div className="container mt-5">
      <h1>Exam History</h1>

      {history.length === 0 ? (
        <p>No exam history found.</p>
      ) : (
        <table className="table table-bordered table-striped mt-4">
          <thead>
            <tr>
              <th>Date</th>
              <th>Difficulty</th>
              <th>Reading</th>
              <th>Writing</th>
              <th>Listening</th>
              <th>Speaking</th>
              <th>Overall</th>
            </tr>
          </thead>

          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{new Date(item.created_at).toLocaleString()}</td>
                <td>{item.difficulty}</td>
                <td>{item.reading}</td>
                <td>{item.writing}</td>
                <td>{item.listening}</td>
                <td>{item.speaking}</td>
                <td><strong>{item.overall}</strong></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default History;