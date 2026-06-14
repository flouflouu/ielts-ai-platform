import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <section className="hero-section hero-section-rich">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-7">
              <span className="badge bg-primary mb-3">
                AI-Powered IELTS Practice Platform
              </span>

              <h1 className="hero-title">
                Train for IELTS with a cleaner,
                <span className="gradient-text"> smarter mock exam</span>
              </h1>

              <p className="lead mt-4 text-muted">
                Practice Reading, Writing, Listening, and Speaking in an online
                exam-style workspace with clickable answers, voice tools,
                IELTS-style band feedback, raw score summaries, and full review.
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

              <div className="hero-mini-stats mt-5">
                <div>
                  <strong>4</strong>
                  <span>IELTS skills</span>
                </div>
                <div>
                  <strong>1-skill</strong>
                  <span>focused practice</span>
                </div>
                <div>
                  <strong>Full</strong>
                  <span>exam review</span>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="mock-browser-card">
                <div className="browser-dots">
                  <span></span><span></span><span></span>
                </div>

                <div className="mock-exam-preview">
                  <div className="preview-header">
                    <span>IELTS Online Mock</span>
                    <strong>Medium</strong>
                  </div>

                  <div className="preview-question">
                    <small>Reading Passage</small>
                    <p>
                      Researchers have found that urban green spaces can improve
                      concentration, reduce stress, and support healthier daily routines.
                    </p>
                  </div>

                  <div className="preview-option selected">A. Improved concentration</div>
                  <div className="preview-option">B. Higher transport costs</div>
                  <div className="preview-option">C. Reduced public access</div>

                  <div className="preview-score">
                    <span>Score</span>
                    <strong>7.5/9</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <span className="badge bg-primary mb-3">Exam Features</span>
          <h2 className="section-title">Built like a real online practice room</h2>
          <p className="text-muted">
            Cleaner layout, better question formatting, and useful controls for practice.
          </p>
        </div>

        <div className="row g-4">
          <div className="col-md-6 col-lg-3">
            <div className="card feature-card h-100 p-4">
              <div className="feature-icon">📖</div>
              <h5>Reading</h5>
              <p className="text-muted mb-0">
                Longer passages with clickable MCQs and clean answer spacing.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card feature-card h-100 p-4">
              <div className="feature-icon">✍️</div>
              <h5>Writing</h5>
              <p className="text-muted mb-0">
                Task 1 and Task 2 with tables, prompts, and word counting.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card feature-card h-100 p-4">
              <div className="feature-icon">🔊</div>
              <h5>Listening</h5>
              <p className="text-muted mb-0">
                Hidden audio scripts, visible questions, and pause/resume controls.
              </p>
            </div>
          </div>

          <div className="col-md-6 col-lg-3">
            <div className="card feature-card h-100 p-4">
              <div className="feature-icon">🎤</div>
              <h5>Speaking</h5>
              <p className="text-muted mb-0">
                Interview-style prompts with voice recording and read-only transcripts.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="home-format-section py-5">
        <div className="container">
          <div className="row align-items-center g-4">
            <div className="col-lg-5">
              <span className="badge bg-primary mb-3">Flexible Practice</span>
              <h2 className="section-title">Choose full exam or one section</h2>
              <p className="text-muted">
                Students can run a full mock exam or focus only on Reading,
                Writing, Listening, or Speaking. They can also paste their own
                practice material so the AI can generate similar questions.
              </p>
              <Link to="/exam" className="btn btn-primary">
                Open Practice Exam
              </Link>
            </div>

            <div className="col-lg-7">
              <div className="row g-3">
                {[
                  ["Full Mock", "All four sections in order"],
                  ["Reading Only", "Passage + objective questions"],
                  ["Writing Only", "Task 1 + Task 2"],
                  ["Listening Only", "Audio controls + MCQs"],
                  ["Speaking Only", "Interview, cue card, discussion"],
                  ["Upload Practice", "Generate similar difficulty questions"]
                ].map(([title, text]) => (
                  <div className="col-md-6" key={title}>
                    <div className="format-tile">
                      <strong>{title}</strong>
                      <span>{text}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-5">
        <div className="text-center mb-5">
          <h2 className="section-title">How it works</h2>
          <p className="text-muted">
            A simple practice flow from generation to review.
          </p>
        </div>

        <div className="timeline-grid">
          <div className="timeline-card">
            <span>01</span>
            <h5>Select your mode</h5>
            <p>Choose full exam or one skill, then select the difficulty level.</p>
          </div>
          <div className="timeline-card">
            <span>02</span>
            <h5>Complete the test</h5>
            <p>Use clickable MCQs, writing boxes, audio controls, and speaking recording.</p>
          </div>
          <div className="timeline-card">
            <span>03</span>
            <h5>Review your results</h5>
            <p>See band scores out of 9, raw MCQ scores, feedback, and full exam review.</p>
          </div>
        </div>
      </section>

      <section className="container pb-5">
        <div className="cta-panel text-center">
          <span className="badge bg-light text-dark mb-3">Ready?</span>
          <h2>Start an IELTS-style mock practice now</h2>
          <p>
            Generate original questions, complete the exam, and review your score breakdown.
          </p>
          <Link to="/exam" className="btn btn-light btn-lg">
            Start Practice Now
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
