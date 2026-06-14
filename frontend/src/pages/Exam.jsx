import { useMemo, useState } from "react";
import axios from "axios";

const SECTION_OPTIONS = [
  { value: "full", label: "Full Mock Exam", helper: "Reading, Writing, Listening, and Speaking" },
  { value: "reading", label: "Reading Only", helper: "Passage + clickable MCQs" },
  { value: "writing", label: "Writing Only", helper: "Task 1 + Task 2" },
  { value: "listening", label: "Listening Only", helper: "Audio script + questions" },
  { value: "speaking", label: "Speaking Only", helper: "Interview, cue card, discussion" }
];

const SKILL_TITLES = {
  reading: "Reading",
  writing: "Writing",
  listening: "Listening",
  speaking: "Speaking"
};

const SKILL_ORDER = ["reading", "writing", "listening", "speaking"];

function Exam() {
  const [difficulty, setDifficulty] = useState("medium");
  const [sectionMode, setSectionMode] = useState("full");
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [currentSkill, setCurrentSkill] = useState("reading");
  const [loading, setLoading] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [uploadSection, setUploadSection] = useState("reading");
  const [uploadedText, setUploadedText] = useState("");
  const [uploadAnalysis, setUploadAnalysis] = useState(null);
  const [speechStatus, setSpeechStatus] = useState("idle");
  const [activeSpeechLabel, setActiveSpeechLabel] = useState("");
  const [playedAudioLabels, setPlayedAudioLabels] = useState([]);

  const selectedSections = useMemo(() => {
    if (sectionMode === "full") return SKILL_ORDER;
    return [sectionMode];
  }, [sectionMode]);

  const activeSections = useMemo(() => {
    if (!questions?.meta?.sections) return selectedSections;
    return SKILL_ORDER.filter((skill) => questions.meta.sections.includes(skill));
  }, [questions, selectedSections]);

  const currentSectionIndex = Math.max(activeSections.indexOf(currentSkill), 0);

  const wordCount = (value) => String(value || "").trim().split(/\s+/).filter(Boolean).length;

  const countAnswerableQuestions = () => {
    if (!questions) return { answered: 0, total: 0 };

    let total = 0;
    let answered = 0;

    activeSections.forEach((skill) => {
      const items = Array.isArray(questions[skill]) ? questions[skill] : [];

      if (skill === "writing" || skill === "speaking") {
        items.forEach((_, itemIndex) => {
          const key = `${skill}-${itemIndex}`;
          total += 1;
          if (answers[key]) answered += 1;
        });
        return;
      }

      items.forEach((item, itemIndex) => {
        (item.questions || []).forEach((_, questionIndex) => {
          const key = `${skill}-${itemIndex}-${questionIndex}`;
          total += 1;
          if (answers[key]) answered += 1;
        });
      });
    });

    return { answered, total };
  };

  const answerProgress = countAnswerableQuestions();

  const getCurrentItems = (skill) => {
    if (!questions) return [];
    return Array.isArray(questions[skill]) ? questions[skill] : [];
  };

  const setAnswer = (key, value) => {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  };

  const speakQuestion = (text, label = "Recording") => {
    if (!text || playedAudioLabels.includes(label)) return;

    window.speechSynthesis.cancel();
    setPlayedAudioLabels((prev) => [...prev, label]);

    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    speech.rate = 0.92;
    speech.onstart = () => {
      setSpeechStatus("playing");
      setActiveSpeechLabel(label);
    };
    speech.onend = () => {
      setSpeechStatus("idle");
      setActiveSpeechLabel("");
    };
    speech.onerror = () => {
      setSpeechStatus("idle");
      setActiveSpeechLabel("");
    };
    window.speechSynthesis.speak(speech);
  };

  const pauseSpeech = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setSpeechStatus("paused");
    }
  };

  const resumeSpeech = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setSpeechStatus("playing");
    }
  };

  const renderAudioControls = (text, label) => {
    const hasPlayed = playedAudioLabels.includes(label);

    return (
      <div className="audio-control-bar">
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => speakQuestion(text, label)}
          disabled={hasPlayed || speechStatus !== "idle"}
        >
          {hasPlayed ? "Played" : "🔊 Play Once"}
        </button>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={pauseSpeech}
        disabled={speechStatus !== "playing" || activeSpeechLabel !== label}
      >
        ⏸ Pause
      </button>
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={resumeSpeech}
        disabled={speechStatus !== "paused" || activeSpeechLabel !== label}
      >
        ▶ Resume
      </button>
      {activeSpeechLabel === label && speechStatus !== "idle" && (
        <span className="audio-status text-capitalize">{speechStatus}</span>
      )}
    </div>
    );
  };

  const startSpeechRecognition = (answerKey) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Try Google Chrome.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setAnswer(answerKey, transcript);
    };

    recognition.onerror = () => {
      alert("Speech recognition failed. Please try again.");
    };
  };

  const generateExam = async () => {
    try {
      setLoading(true);
      setResult(null);
      setShowReview(false);
      setUploadAnalysis(null);

      const response = await axios.post(
        "http://localhost:3000/generate-exam",
        {
          difficulty,
          sections: selectedSections
        },
        { withCredentials: true }
      );

      setQuestions(response.data);
      setAnswers({});
      setPlayedAudioLabels([]);
      const firstSection = response.data?.meta?.sections?.[0] || selectedSections[0] || "reading";
      setCurrentSkill(firstSection);
    } catch (error) {
      console.log(error);
      alert("Failed to generate exam. Please make sure you are logged in and your Hugging Face token works.");
    } finally {
      setLoading(false);
    }
  };

  const analyzeUploadedPractice = async () => {
    try {
      if (!uploadedText.trim()) {
        alert("Please upload or paste some practice material first.");
        return;
      }

      setLoading(true);
      setResult(null);
      setShowReview(false);

      const response = await axios.post(
        "http://localhost:3000/analyze-upload",
        {
          section: uploadSection,
          content: uploadedText
        },
        { withCredentials: true }
      );

      setUploadAnalysis(response.data.analysis);
      setQuestions(response.data.practiceExam);
      setPlayedAudioLabels([]);
      setDifficulty(response.data.practiceExam?.meta?.difficulty || "medium");
      setSectionMode(uploadSection);
      setCurrentSkill(uploadSection);
      setAnswers({});
    } catch (error) {
      console.log(error);
      alert("Failed to analyze uploaded practice material.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setUploadedText(String(reader.result || ""));
    };
    reader.readAsText(file);
  };

  const goNext = () => {
    if (currentSectionIndex < activeSections.length - 1) {
      setCurrentSkill(activeSections[currentSectionIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const goPrevious = () => {
    if (currentSectionIndex > 0) {
      setCurrentSkill(activeSections[currentSectionIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const submitExam = async () => {
    try {
      setLoading(true);

      const response = await axios.post(
        "http://localhost:3000/grade-exam",
        {
          questions,
          answers,
          difficulty: questions?.meta?.difficulty || difficulty,
          sections: activeSections
        },
        { withCredentials: true }
      );

      setResult(response.data);
      setShowReview(false);
      window.scrollTo(0, 0);
    } catch (error) {
      console.log(error);
      alert("Failed to submit exam.");
    } finally {
      setLoading(false);
    }
  };

  const renderDataTable = (table) => {
    if (!table || !Array.isArray(table.headers) || !Array.isArray(table.rows)) return null;

    return (
      <div className="ielts-table-wrap my-3">
        {table.title && <h6 className="mb-3">{table.title}</h6>}
        <table className="table table-bordered table-hover align-middle mb-0">
          <thead>
            <tr>
              {table.headers.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderQuestion = (skill, item, itemIndex, question, questionIndex) => {
    const answerKey = `${skill}-${itemIndex}-${questionIndex}`;
    const selectedAnswer = answers[answerKey] || "";

    if (question.type === "mcq" && Array.isArray(question.options)) {
      return (
        <div className="ielts-question" key={question.id || answerKey}>
          <p className="question-prompt">
            <span className="question-number">{questionIndex + 1}</span>
            {question.prompt}
          </p>

          <div className="option-grid">
            {question.options.map((option, optionIndex) => {
              const active = selectedAnswer === option;
              return (
                <button
                  key={optionIndex}
                  type="button"
                  className={`option-card ${active ? "selected" : ""}`}
                  onClick={() => setAnswer(answerKey, option)}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div className="ielts-question" key={question.id || answerKey}>
        <p className="question-prompt">
          <span className="question-number">{questionIndex + 1}</span>
          {question.prompt}
        </p>
        <input
          className="form-control"
          value={selectedAnswer}
          placeholder="Type your answer"
          onChange={(e) => setAnswer(answerKey, e.target.value)}
        />
      </div>
    );
  };

  const renderReadingItem = (item, itemIndex) => (
    <div className="ielts-paper card p-4 mb-4" key={item.id || itemIndex}>
      <div className="paper-header">
        <div>
          <span className="paper-label">Reading Passage</span>
          <h3>{item.title || `Reading Passage ${itemIndex + 1}`}</h3>
        </div>
        <span className="badge bg-primary">{item.questions?.length || 0} questions</span>
      </div>

      <p className="instructions">{item.instructions || "Read the passage and answer the questions."}</p>
      <div className="passage-box">
        {item.passage}
      </div>

      <div className="questions-panel mt-4">
        {(item.questions || []).map((question, questionIndex) =>
          renderQuestion("reading", item, itemIndex, question, questionIndex)
        )}
      </div>
    </div>
  );

  const renderWritingItem = (item, itemIndex) => {
    const answerKey = `writing-${itemIndex}`;

    return (
      <div className="ielts-paper card p-4 mb-4" key={item.id || itemIndex}>
        <div className="paper-header">
          <div>
            <span className="paper-label">{item.taskType || "Writing Task"}</span>
            <h3>{item.title || `Writing Task ${itemIndex + 1}`}</h3>
          </div>
          <span className="badge bg-primary">{item.difficulty || difficulty}</span>
        </div>

        <p className="instructions">{item.instructions}</p>
        {renderDataTable(item.table)}
        <div className="prompt-box">{item.prompt}</div>

        <textarea
          className="form-control mt-3 writing-area"
          rows="10"
          value={answers[answerKey] || ""}
          placeholder="Write your response here..."
          onChange={(e) => setAnswer(answerKey, e.target.value)}
        />
        <div className="word-count mt-2">
          Words: {wordCount(answers[answerKey])} {itemIndex === 0 ? "/ recommended 150+" : "/ recommended 250+"}
        </div>
      </div>
    );
  };

  const renderListeningItem = (item, itemIndex) => (
    <div className="ielts-paper card p-4 mb-4" key={item.id || itemIndex}>
      <div className="paper-header">
        <div>
          <span className="paper-label">Listening Section</span>
          <h3>{item.title || `Listening Recording ${itemIndex + 1}`}</h3>
        </div>
        {renderAudioControls(item.audioScript, `Listening ${itemIndex + 1}`)}
      </div>

      <p className="instructions">
        {item.instructions || "Listen to the recording and answer the questions below."}
      </p>

      <div className="recording-note">
        The audio script is hidden during the test. Use the recording button and answer the visible questions.
      </div>

      <div className="questions-panel mt-4">
        {(item.questions || []).map((question, questionIndex) =>
          renderQuestion("listening", item, itemIndex, question, questionIndex)
        )}
      </div>
    </div>
  );

  const renderSpeakingItem = (item, itemIndex) => {
    const answerKey = `speaking-${itemIndex}`;
    const spokenText = [item.prompt, ...(item.bulletPoints || [])].filter(Boolean).join(". ");

    return (
      <div className="ielts-paper card p-4 mb-4" key={item.id || itemIndex}>
        <div className="paper-header">
          <div>
            <span className="paper-label">{item.part || "Speaking"}</span>
            <h3>{item.title || `Speaking Question ${itemIndex + 1}`}</h3>
          </div>
          <span className="badge bg-secondary">Question hidden</span>
        </div>

        <p className="instructions">
          {item.instructions || "Listen to the examiner and answer naturally."}
        </p>

        <div className="mb-3">
          {renderAudioControls(spokenText, `Speaking ${itemIndex + 1}`)}
        </div>

        <div className="d-flex gap-2 flex-wrap mb-3">
          <button
            type="button"
            className="btn btn-info"
            onClick={() => startSpeechRecognition(answerKey)}
          >
            🎤 Record Answer
          </button>
        </div>

        <textarea
          className="form-control speaking-transcript"
          rows="5"
          value={answers[answerKey] || ""}
          placeholder="Your spoken answer transcript will appear here..."
          readOnly
        />
      </div>
    );
  };

  const renderCurrentSection = () => {
    const items = getCurrentItems(currentSkill);

    if (items.length === 0) {
      return (
        <div className="card p-4">
          <p className="mb-0">No questions were generated for this section.</p>
        </div>
      );
    }

    if (currentSkill === "reading") return items.map(renderReadingItem);
    if (currentSkill === "writing") return items.map(renderWritingItem);
    if (currentSkill === "listening") return items.map(renderListeningItem);
    if (currentSkill === "speaking") return items.map(renderSpeakingItem);

    return null;
  };

  const renderScore = (label, value, rawMark = null) => {
    if (value === null || value === undefined) return null;
    return (
      <div className="score-pill">
        <span>{label}</span>
        <strong>{value}/9</strong>
        {rawMark && (
          <small>Raw: {rawMark.correct}/{rawMark.total} · scaled {rawMark.scaledOutOf40}/40</small>
        )}
      </div>
    );
  };

  const renderReview = () => {
    if (!questions) return null;

    return (
      <div className="review-area mt-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div>
            <h3 className="section-title mb-1">Exam Review</h3>
            <p className="text-muted mb-0">Difficulty level and correct answers are shown below.</p>
          </div>
          <span className="badge bg-primary text-capitalize">
            {questions.meta?.difficulty || difficulty}
          </span>
        </div>

        {activeSections.map((skill) => (
          <div key={skill} className="review-section card p-4 mb-4">
            <h4>{SKILL_TITLES[skill]}</h4>

            {getCurrentItems(skill).map((item, itemIndex) => (
              <div key={item.id || itemIndex} className="review-item">
                <div className="d-flex justify-content-between align-items-start gap-3">
                  <h5>{item.title || `${SKILL_TITLES[skill]} Item ${itemIndex + 1}`}</h5>
                  <span className="badge bg-secondary text-capitalize">{item.difficulty || difficulty}</span>
                </div>

                {skill === "reading" && <div className="passage-box small-review">{item.passage}</div>}
                {skill === "listening" && <div className="passage-box small-review"><strong>Audio Script:</strong> {item.audioScript}</div>}
                {skill === "writing" && (
                  <>
                    {renderDataTable(item.table)}
                    <div className="prompt-box">{item.prompt}</div>
                    <div className="answer-review"><strong>Your answer:</strong> {answers[`writing-${itemIndex}`] || "No answer"}</div>
                  </>
                )}
                {skill === "speaking" && (
                  <>
                    <div className="prompt-box">
                      <strong>Question:</strong> {[item.prompt, ...(item.bulletPoints || [])].filter(Boolean).join(" / ")}
                    </div>
                    <div className="answer-review"><strong>Your answer:</strong> {answers[`speaking-${itemIndex}`] || "No answer"}</div>
                  </>
                )}

                {(item.questions || []).map((question, questionIndex) => {
                  const answerKey = `${skill}-${itemIndex}-${questionIndex}`;
                  return (
                    <div className="answer-review" key={question.id || answerKey}>
                      <strong>{questionIndex + 1}. {question.prompt}</strong>
                      <div>Your answer: {answers[answerKey] || "No answer"}</div>
                      {question.correctAnswer && <div>Correct answer: {question.correctAnswer}</div>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container page-container ielts-exam-page">
      <div className="exam-hero mb-4">
        <span className="badge bg-primary mb-3">IELTS Online Mock Practice</span>
        <h1 className="section-title">Practice Exam</h1>
        <p className="text-muted mb-0">
          Choose a full mock exam or focus on one skill. Questions use IELTS-style structure with clean online formatting.
        </p>
      </div>

      {!questions && (
        <div className="row g-4">
          <div className="col-lg-7">
            <div className="card p-4 exam-setup-card">
              <h3 className="section-title">Generate New Practice</h3>
              <p className="text-muted">Select the difficulty and sections you want to practice.</p>

              <div className="mb-4">
                <label className="form-label">Difficulty</label>
                <select
                  className="form-control"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="form-label">Practice Mode</label>
                <div className="section-choice-grid">
                  {SECTION_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={`section-choice ${sectionMode === option.value ? "selected" : ""}`}
                      onClick={() => setSectionMode(option.value)}
                    >
                      <strong>{option.label}</strong>
                      <span>{option.helper}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn btn-primary btn-lg" onClick={generateExam} disabled={loading}>
                {loading ? "Generating..." : "Generate Practice"}
              </button>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card p-4 upload-card">
              <h3 className="section-title">Practice from Your Own Mock</h3>
              <p className="text-muted">
                Upload or paste practice material. The AI will estimate difficulty and create new questions for the same section.
              </p>

              <label className="form-label">Target Section</label>
              <select
                className="form-control mb-3"
                value={uploadSection}
                onChange={(e) => setUploadSection(e.target.value)}
              >
                {SKILL_ORDER.map((skill) => (
                  <option key={skill} value={skill}>{SKILL_TITLES[skill]}</option>
                ))}
              </select>

              <input className="form-control mb-3" type="file" accept=".txt,.csv,.md" onChange={handleFileUpload} />
              <textarea
                className="form-control mb-3"
                rows="7"
                value={uploadedText}
                placeholder="Or paste your mock exam/question text here..."
                onChange={(e) => setUploadedText(e.target.value)}
              />

              <button className="btn btn-outline-primary" onClick={analyzeUploadedPractice} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze and Generate Similar Practice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {uploadAnalysis && (
        <div className="alert alert-info mt-4">
          <strong>Uploaded material difficulty:</strong> {uploadAnalysis.estimatedDifficulty || "medium"}. {uploadAnalysis.reason}
        </div>
      )}

      {questions && !result && (
        <div className="exam-workspace">
          <div className="sticky-exam-top card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center gap-3 flex-wrap">
              <div>
                <span className="paper-label">Current Section</span>
                <h2 className="mb-1">{SKILL_TITLES[currentSkill]}</h2>
                <p className="text-muted mb-0">
                  Difficulty: <span className="text-capitalize">{questions.meta?.difficulty || difficulty}</span>
                </p>
              </div>
              <div className="text-end">
                <span className="badge bg-primary">
                  {currentSectionIndex + 1} / {activeSections.length}
                </span>
                <div className="answer-progress mt-2">
                  Answered {answerProgress.answered}/{answerProgress.total}
                </div>
              </div>
            </div>

            <div className="section-tabs mt-3">
              {activeSections.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  className={`section-tab ${currentSkill === skill ? "active" : ""}`}
                  onClick={() => setCurrentSkill(skill)}
                >
                  {SKILL_TITLES[skill]}
                </button>
              ))}
            </div>

            <div className="progress mt-3">
              <div
                className="progress-bar"
                style={{ width: `${((currentSectionIndex + 1) / activeSections.length) * 100}%` }}
              />
            </div>
          </div>

          {renderCurrentSection()}

          <div className="d-flex justify-content-between align-items-center gap-2 flex-wrap mt-4">
            <button className="btn btn-outline-secondary" onClick={goPrevious} disabled={currentSectionIndex === 0}>
              Previous
            </button>

            <button
              className="btn btn-outline-danger"
              onClick={() => {
                const cleared = { ...answers };
                const items = getCurrentItems(currentSkill);
                items.forEach((item, itemIndex) => {
                  delete cleared[`${currentSkill}-${itemIndex}`];
                  (item.questions || []).forEach((_, questionIndex) => {
                    delete cleared[`${currentSkill}-${itemIndex}-${questionIndex}`];
                  });
                });
                setAnswers(cleared);
              }}
            >
              Clear Current Section
            </button>

            {currentSectionIndex < activeSections.length - 1 ? (
              <button className="btn btn-primary" onClick={goNext}>Next Section</button>
            ) : (
              <button className="btn btn-success" onClick={submitExam} disabled={loading}>
                {loading ? "Submitting..." : "Submit Practice"}
              </button>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="results-panel card p-4 mt-4">
          <span className="badge bg-primary mb-3">Practice Result</span>
          <h2 className="section-title">Your IELTS-Style Score</h2>
          <p className="text-muted">{result.notice || "Practice score only. This is not an official IELTS result."}</p>

          <div className="score-grid my-4">
            {renderScore("Reading", result.reading, result.autoMarked?.reading)}
            {renderScore("Writing", result.writing)}
            {renderScore("Listening", result.listening, result.autoMarked?.listening)}
            {renderScore("Speaking", result.speaking)}
            {renderScore("Overall", result.overall)}
          </div>

          {result.scoreSummary && (
            <div className="score-summary-panel mb-4">
              <div>
                <span>Total band score</span>
                <strong>{result.scoreSummary.bandScore}</strong>
              </div>
              <div>
                <span>Objective MCQ score</span>
                <strong>{result.scoreSummary.objectiveScore}</strong>
              </div>
              <p className="mb-0">{result.scoreSummary.explanation}</p>
            </div>
          )}

          <div className="feedback-box">
            <h5>Examiner Feedback</h5>
            <p className="mb-0">{result.feedback}</p>
          </div>

          {result.sectionFeedback && (
            <div className="row mt-3">
              {Object.entries(result.sectionFeedback).map(([section, feedback]) => (
                feedback ? (
                  <div className="col-md-6 mb-3" key={section}>
                    <div className="card p-3 h-100">
                      <h6 className="text-capitalize">{section}</h6>
                      <p className="text-muted mb-0">{feedback}</p>
                    </div>
                  </div>
                ) : null
              ))}
            </div>
          )}

          <div className="d-flex gap-2 flex-wrap mt-4">
            <button className="btn btn-primary" onClick={() => setShowReview((prev) => !prev)}>
              {showReview ? "Hide Review" : "Check Full Exam Review"}
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={() => {
                setQuestions(null);
                setAnswers({});
                setPlayedAudioLabels([]);
                setResult(null);
                setShowReview(false);
                setUploadAnalysis(null);
              }}
            >
              Start New Practice
            </button>
          </div>

          {showReview && renderReview()}
        </div>
      )}
    </div>
  );
}

export default Exam;
