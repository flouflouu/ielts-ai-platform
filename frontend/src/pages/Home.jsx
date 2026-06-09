import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="bg-light py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-7">
              <h1 className="display-4 fw-bold">
                AI IELTS Practice Platform
              </h1>

              <p className="lead mt-3">
                Practice IELTS Reading, Writing, Listening, and Speaking with
                AI-generated questions, instant grading, and personalized
                feedback.
              </p>

              <div className="mt-4 d-flex gap-3 flex-wrap">
                <Link to="/exam" className="btn btn-primary btn-lg">
                  Start Practice
                </Link>

                <Link to="/dashboard" className="btn btn-outline-primary btn-lg">
                  View Dashboard
                </Link>

                <Link to="/history" className="btn btn-outline-secondary btn-lg">
                  Exam History
                </Link>
              </div>
            </div>

            <div className="col-md-5 mt-4 mt-md-0">
              <div className="card shadow p-4">
                <h4 className="mb-3">What you can practice</h4>

                <ul className="list-group list-group-flush">
                  <li className="list-group-item">
                    📖 Reading comprehension questions
                  </li>

                  <li className="list-group-item">
                    ✍️ Writing practice with AI feedback
                  </li>

                  <li className="list-group-item">
                    🔊 Listening practice with audio playback
                  </li>

                  <li className="list-group-item">
                    🎤 Speaking interview with voice recording
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2>How It Works</h2>
          <p className="text-muted">
            Practice, submit, and track your IELTS progress.
          </p>
        </div>

        <div className="row">
          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm p-4 text-center">
              <h3>1</h3>
              <h5>Choose Difficulty</h5>
              <p className="text-muted">
                Select Easy, Medium, or Hard based on your current level.
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm p-4 text-center">
              <h3>2</h3>
              <h5>Complete the Exam</h5>
              <p className="text-muted">
                Go through Reading, Writing, Listening, and Speaking one section
                at a time.
              </p>
            </div>
          </div>

          <div className="col-md-4 mb-3">
            <div className="card h-100 shadow-sm p-4 text-center">
              <h3>3</h3>
              <h5>Get AI Feedback</h5>
              <p className="text-muted">
                Receive IELTS band scores and feedback, then track your progress
                in the dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-dark text-white py-5">
        <div className="container text-center">
          <h2>Ready to practice?</h2>

          <p className="mb-4">
            Start a new AI-generated IELTS practice exam now.
          </p>

          <Link to="/exam" className="btn btn-light btn-lg">
            Start Practice
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;