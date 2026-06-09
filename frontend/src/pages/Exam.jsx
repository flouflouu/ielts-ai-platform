import { useState } from "react";
import axios from "axios";

function Exam() {

  const [difficulty, setDifficulty] =
    useState("easy");

  const [questions, setQuestions] =
    useState(null);

  const [answers, setAnswers] =
    useState({});

  const [result, setResult] =
    useState(null);

  // TEXT TO SPEECH FOR LISTENING

  const speakQuestion = (text) => {

    const speech =
      new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";

    window.speechSynthesis.speak(
      speech
    );

  };

  // SPEECH TO TEXT FOR SPEAKING

  const startSpeechRecognition =
    (questionIndex) => {

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;

      if (!SpeechRecognition) {

        alert(
          "Speech Recognition is not supported in this browser."
        );

        return;

      }

      const recognition =
        new SpeechRecognition();

      recognition.lang = "en-US";

      recognition.start();

      recognition.onresult =
        (event) => {

          const transcript =
            event.results[0][0]
              .transcript;

          setAnswers(prev => ({
            ...prev,
            [`speaking${questionIndex}`]:
              transcript
          }));

        };

    };

  // GENERATE EXAM

  const generateExam = async () => {

    try {

      const response =
  await axios.post(
    "http://localhost:3000/generate-exam",
    {
      difficulty
    },
    {
      withCredentials: true
    }
  );

      setQuestions(
        response.data
      );

      setAnswers({});

      setResult(null);

    } catch (error) {

      console.log(error);

    }

  };

  // SUBMIT EXAM

  const submitExam = async () => {

    try {

      const response =
        await axios.post(
  "http://localhost:3000/grade-exam",
  {
    questions,
    answers,
    difficulty
  },
  {
    withCredentials: true
  }
);

      setResult(
        response.data
      );

    } catch (error) {

      console.log(error);

    }

  };

  return (

    <div className="container mt-5">

      <h1>
        IELTS Practice Exam
      </h1>

      <div className="mb-3">

        <label className="form-label">
          Difficulty
        </label>

        <select
          className="form-control"
          value={difficulty}
          onChange={(e) =>
            setDifficulty(
              e.target.value
            )
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

      {questions && (

        <div className="mt-4">

          {/* READING */}

          <h3>Reading</h3>

          {questions.reading.map(
            (q, index) => (

              <div
                key={`reading-${index}`}
              >

                <p>{q}</p>

                <textarea
                  className="form-control mb-3"
                  placeholder="Your answer..."
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [`reading${index}`]:
                        e.target.value
                    })
                  }
                />

              </div>

            )
          )}

          {/* WRITING */}

          <h3>Writing</h3>

          {questions.writing.map(
            (q, index) => (

              <div
                key={`writing-${index}`}
              >

                <p>{q}</p>

                <textarea
                  className="form-control mb-3"
                  rows="5"
                  placeholder="Write your response..."
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [`writing${index}`]:
                        e.target.value
                    })
                  }
                />

              </div>

            )
          )}

          {/* LISTENING */}

          <h3>Listening</h3>

          {questions.listening.map(
            (q, index) => (

              <div
                key={`listening-${index}`}
              >

                <p>{q}</p>

                <button
                  className="btn btn-secondary mb-2"
                  onClick={() =>
                    speakQuestion(q)
                  }
                >
                  🔊 Play Audio
                </button>

                <textarea
                  className="form-control mb-3"
                  placeholder="Your answer..."
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [`listening${index}`]:
                        e.target.value
                    })
                  }
                />

              </div>

            )
          )}

          {/* SPEAKING */}

          <h3>Speaking</h3>

          {questions.speaking.map(
            (q, index) => (

              <div
                key={`speaking-${index}`}
              >

                <p>{q}</p>

                <button
                  className="btn btn-info mb-2"
                  onClick={() =>
                    startSpeechRecognition(
                      index
                    )
                  }
                >
                  🎤 Record Answer
                </button>

                <textarea
                  className="form-control mb-3"
                  value={
                    answers[
                      `speaking${index}`
                    ] || ""
                  }
                  placeholder="Your response..."
                  onChange={(e) =>
                    setAnswers({
                      ...answers,
                      [`speaking${index}`]:
                        e.target.value
                    })
                  }
                />

              </div>

            )
          )}

          <button
            className="btn btn-success mt-4"
            onClick={submitExam}
          >
            Submit Exam
          </button>

          {/* RESULTS */}

          {result && (

            <div
              className="card mt-4 p-4"
            >

              <h3>
                Results
              </h3>

              <p>
                <strong>
                  Reading:
                </strong>{" "}
                {result.reading}
              </p>

              <p>
                <strong>
                  Writing:
                </strong>{" "}
                {result.writing}
              </p>

              <p>
                <strong>
                  Listening:
                </strong>{" "}
                {result.listening}
              </p>

              <p>
                <strong>
                  Speaking:
                </strong>{" "}
                {result.speaking}
              </p>

              <h4>
                Overall Band:
                {" "}
                {result.overall}
              </h4>

              <p>
                {result.feedback}
              </p>

              {result.overall >= 7 &&
                difficulty === "easy" && (

                <div className="alert alert-success mt-3">

                  Great work!

                  You may be ready
                  for Medium
                  difficulty.

                </div>

              )}

              {result.overall >= 7 &&
                difficulty === "medium" && (

                <div className="alert alert-success mt-3">

                  Excellent!

                  You may be ready
                  for Hard
                  difficulty.

                </div>

              )}

            </div>

          )}

        </div>

      )}

    </div>

  );

}

export default Exam;