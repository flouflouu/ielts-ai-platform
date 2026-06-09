import { useState } from "react";
import axios from "axios";

function Exam() {
  const [difficulty, setDifficulty] = useState("easy");
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [currentSkill, setCurrentSkill] = useState("reading");

  const skillOrder = [
    "reading",
    "writing",
    "listening",
    "speaking"
  ];

  const skillTitles = {
    reading: "Reading",
    writing: "Writing",
    listening: "Listening",
    speaking: "Speaking"
  };

  const speakingInterviewQuestions = [
    "What is your full name?",
    "Where are you from?",
    "What are your hobbies?",
    "Do you work or study?",
    "Why are you practicing IELTS speaking?"
  ];

  const cleanSpeakingQuestion = (text) => {
  return text
    .replace(/Prompt\s*\d+\s*:/gi, "")
    .trim();
};

const splitSpeakingPrompts = (speakingQuestions) => {
  const splitQuestions = [];

  speakingQuestions.forEach((item) => {
    const parts = item
      .split(/Prompt\s*\d+\s*:/gi)
      .map((part) => part.trim())
      .filter((part) => part.length > 0);

    if (parts.length > 0) {
      splitQuestions.push(...parts);
    } else {
      splitQuestions.push(cleanSpeakingQuestion(item));
    }
  });

  return splitQuestions;
};

const getCurrentQuestions = (skill) => {
  if (!questions) return [];

  if (skill === "speaking") {
    return [
      ...speakingInterviewQuestions,
      ...splitSpeakingPrompts(questions.speaking || [])
    ];
  }

  return questions[skill] || [];
};

  const speakQuestion = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  const startSpeechRecognition = (questionIndex) => {
    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.start();

    recognition.onresult = (event) => {
      const transcript =
        event.results[0][0].transcript;

      setAnswers((prev) => ({
        ...prev,
        [`speaking${questionIndex}`]: transcript
      }));
    };

    recognition.onerror = () => {
      alert("Speech recognition failed. Please try again.");
    };
  };

  const generateExam = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/generate-exam",
        {
          difficulty
        },
        {
          withCredentials: true
        }
      );

      setQuestions(response.data);
      setAnswers({});
      setResult(null);
      setCurrentSkill("reading");

    } catch (error) {
      console.log(error);
      alert("Failed to generate exam. Please make sure you are logged in.");
    }
  };

  const goNext = () => {
    const currentIndex = skillOrder.indexOf(currentSkill);

    if (currentIndex < skillOrder.length - 1) {
      setCurrentSkill(skillOrder[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const goPrevious = () => {
    const currentIndex = skillOrder.indexOf(currentSkill);

    if (currentIndex > 0) {
      setCurrentSkill(skillOrder[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const submitExam = async () => {
    try {
      const questionsForGrading = {
        ...questions,
        speaking: getCurrentQuestions("speaking")
      };

      const response = await axios.post(
        "http://localhost:3000/grade-exam",
        {
          questions: questionsForGrading,
          answers,
          difficulty
        },
        {
          withCredentials: true
        }
      );

      setResult(response.data);
      window.scrollTo(0, 0);

    } catch (error) {
      console.log(error);
      alert("Failed to submit exam.");
    }
  };

  const getListeningDisplayText = (question) => {
  if (question.includes("Questions:")) {
    return question.split("Questions:")[1].trim();
  }

  if (question.includes("Question:")) {
    return question.split("Question:")[1].trim();
  }

  return question;
};

  const extractListeningOptions = (question) => {
    const optionPattern =
      /([A-D][\)\.]\s*[^;,\n]+|[A-D]\s*-\s*[^;,\n]+)/g;

    const matches = question.match(optionPattern);

    if (matches && matches.length > 0) {
      return matches;
    }

    return [];
  };

  const renderQuestionInput = (skill, question, index) => {
    const answerKey = `${skill}${index}`;

    if (skill === "writing") {
      return (
        <textarea
          className="form-control mb-3"
          rows="6"
          value={answers[answerKey] || ""}
          placeholder="Write your response here..."
          onChange={(e) =>
            setAnswers({
              ...answers,
              [answerKey]: e.target.value
            })
          }
        />
      );
    }

    if (skill === "listening") {
      const options = extractListeningOptions(question);

      return (
        <>
          <div className="alert alert-warning">
            Listen to the audio carefully, then answer the question below.
          </div>

          <button
            className="btn btn-secondary mb-3"
            onClick={() => speakQuestion(question)}
          >
            🔊 Play Audio
          </button>

          {options.length > 0 && (
            <div className="card p-3 mb-3">
              <h6>Options</h6>

              {options.map((option, optionIndex) => (
                <p key={optionIndex} className="mb-1">
                  {option}
                </p>
              ))}
            </div>
          )}

          {options.length === 0 && (
            <div className="card p-3 mb-3">
              <p className="mb-0">
                No written options available. Listen to the audio and type your answer.
              </p>
            </div>
          )}

          <textarea
            className="form-control mb-3"
            value={answers[answerKey] || ""}
            placeholder="Type your listening answer..."
            onChange={(e) =>
              setAnswers({
                ...answers,
                [answerKey]: e.target.value
              })
            }
          />
        </>
      );
    }

    if (skill === "speaking") {
      return (
        <>
          <div className="alert alert-info">
            Speaking interview mode. The question is hidden. Click Ask Question to hear it.
          </div>

          <div className="d-flex gap-2 mb-2">
            <button
              className="btn btn-secondary"
              onClick={() => speakQuestion(cleanSpeakingQuestion(question))}
            >
              🗣️ Ask Question
            </button>

            <button
              className="btn btn-info"
              onClick={() => startSpeechRecognition(index)}
            >
              🎤 Record Answer
            </button>
          </div>

          <textarea
            className="form-control mb-3"
            value={answers[answerKey] || ""}
            placeholder="Your spoken answer will appear here..."
            readOnly
          />
        </>
      );
    }

    return (
      <textarea
        className="form-control mb-3"
        value={answers[answerKey] || ""}
        placeholder="Your answer..."
        onChange={(e) =>
          setAnswers({
            ...answers,
            [answerKey]: e.target.value
          })
        }
      />
    );
  };

  const renderQuestionText = (skill, question, index) => {
  if (skill === "speaking") {
    return (
      <h5>
        Speaking Interview Question {index + 1}
      </h5>
    );
  }

  if (skill === "listening") {
    return (
      <>
        <h5>
          Question {index + 1}
        </h5>

        <p style={{ whiteSpace: "pre-line" }}>
          {getListeningDisplayText(question)}
        </p>
      </>
    );
  }

  return (
    <>
      <h5>
        Question {index + 1}
      </h5>

      <p style={{ whiteSpace: "pre-line" }}>
        {question}
      </p>
    </>
  );
};

  return (
    <div className="container mt-5 mb-5">
      <h1>IELTS Practice Exam</h1>

      {!questions && (
        <div className="card p-4 mt-4">
          <h4>Start New Exam</h4>

          <div className="mb-3">
            <label className="form-label">
              Difficulty
            </label>

            <select
              className="form-control"
              value={difficulty}
              onChange={(e) =>
                setDifficulty(e.target.value)
              }
            >
              <option value="easy">
                Easy
              </option>

              <option value="medium">
                Medium
              </option>

              <option value="hard">
                Hard
              </option>
            </select>
          </div>

          <button
            className="btn btn-primary"
            onClick={generateExam}
          >
            Generate Exam
          </button>
        </div>
      )}

      {questions && !result && (
        <div className="mt-4">
          <div className="card p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h3>
                  {skillTitles[currentSkill]} Section
                </h3>

                <p className="text-muted mb-0">
                  Difficulty: {difficulty}
                </p>
              </div>

              <span className="badge bg-primary">
                {skillOrder.indexOf(currentSkill) + 1} / {skillOrder.length}
              </span>
            </div>

            <div className="progress mt-3">
              <div
                className="progress-bar"
                style={{
                  width: `${
                    ((skillOrder.indexOf(currentSkill) + 1) /
                      skillOrder.length) *
                    100
                  }%`
                }}
              >
              </div>
            </div>
          </div>

          {currentSkill === "listening" && (
            <div className="alert alert-warning">
              Listening section: read the question, click Play Audio, then answer based on what you hear.
            </div>
          )}

          {currentSkill === "speaking" && (
            <div className="alert alert-info">
              Speaking section: questions are hidden. Click Ask Question, then Record Answer.
              Your spoken response will appear in the box, but it cannot be typed manually.
            </div>
          )}

          {getCurrentQuestions(currentSkill).map((question, index) => (
            <div
              className="card p-4 mb-3"
              key={`${currentSkill}-${index}`}
            >
              {renderQuestionText(
                currentSkill,
                question,
                index
              )}

              {renderQuestionInput(
                currentSkill,
                question,
                index
              )}
            </div>
          ))}

          <div className="d-flex justify-content-between mt-4">
            <button
              className="btn btn-outline-secondary"
              onClick={goPrevious}
              disabled={currentSkill === "reading"}
            >
              Previous
            </button>

            {currentSkill !== "speaking" ? (
              <button
                className="btn btn-primary"
                onClick={goNext}
              >
                Next
              </button>
            ) : (
              <button
                className="btn btn-success"
                onClick={submitExam}
              >
                Submit Exam
              </button>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="card mt-4 p-4">
          <h3>Results</h3>

          <p>
            <strong>Reading:</strong>{" "}
            {result.reading}
          </p>

          <p>
            <strong>Writing:</strong>{" "}
            {result.writing}
          </p>

          <p>
            <strong>Listening:</strong>{" "}
            {result.listening}
          </p>

          <p>
            <strong>Speaking:</strong>{" "}
            {result.speaking}
          </p>

          <h4>
            Overall Band: {result.overall}
          </h4>

          <p>
            {result.feedback}
          </p>

          {result.overall >= 7 &&
            difficulty === "easy" && (
              <div className="alert alert-success mt-3">
                Great work! You may be ready for Medium difficulty.
              </div>
            )}

          {result.overall >= 7 &&
            difficulty === "medium" && (
              <div className="alert alert-success mt-3">
                Excellent! You may be ready for Hard difficulty.
              </div>
            )}

          <button
            className="btn btn-primary mt-3"
            onClick={() => {
              setQuestions(null);
              setAnswers({});
              setResult(null);
              setCurrentSkill("reading");
            }}
          >
            Start New Exam
          </button>
        </div>
      )}
    </div>
  );
}

export default Exam;