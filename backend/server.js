require("dotenv").config();
const axios = require("axios");
const express = require("express");
const cors = require("cors");
const db = require("./database/db");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());
app.use(
  session({
    secret: "ielts-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

app.get("/", (req,res)=>{
 res.send("Server Running");
});

async function generateIELTSQuestions(difficulty) {

  const response = await axios.post(
    "https://router.huggingface.co/v1/chat/completions",
    {
      model: "Qwen/Qwen3-8B",

      messages: [
        {
          role: "system",
          content:
            "You are an IELTS examiner. Generate real IELTS practice questions. Return only valid JSON. Never use placeholders."
        },
        {
          role: "user",
          content: `
Generate an IELTS practice exam.

Difficulty: ${difficulty}

Return ONLY valid JSON.
Do not use markdown.
Do not use placeholders like q1 or q2.

JSON format:
{
  "reading": [
    "Short passage + 2 questions",
    "Short passage + 2 questions"
  ],
  "writing": [
    "Writing task 1",
    "Writing task 2"
  ],
  "listening": [
    "Short transcript + 2 questions",
    "Short transcript + 2 questions"
  ],
  "speaking": [
    "Speaking prompt 1",
    "Speaking prompt 2"
  ]
}

Keep each item short.
`
        }
      ],

      max_tokens: 2000,
      temperature: 0.5
    },

    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

async function gradeExam(questions, answers) {

  const response = await axios.post(
    "https://router.huggingface.co/v1/chat/completions",
    {
      model: "Qwen/Qwen3-8B",

      messages: [
        {
          role: "system",
          content:
            "You are a certified IELTS examiner. Grade using official IELTS band descriptors. Return only valid JSON."
        },

        {
          role: "user",
          content: `
Questions:

${JSON.stringify(questions, null, 2)}

Answers:

${JSON.stringify(answers, null, 2)}

Evaluate the answers as an IELTS examiner.

Return ONLY valid JSON:

{
  "reading": 0,
  "writing": 0,
  "listening": 0,
  "speaking": 0,
  "overall": 0,
  "feedback": ""
}

IMPORTANT:
- Use IELTS band scores from 0 to 9.
- Decimals such as 6.5, 7.0, and 7.5 are allowed.
- Reading, Writing, Listening, and Speaking should each have a band score.
- Overall should be the average IELTS band score.
- Feedback should explain strengths and weaknesses.
- Return valid JSON only.
`
        }
      ],

      temperature: 0.3
    },

    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
}

app.post("/login", (req, res) => {

  const { email, password } = req.body;

  const sql =
    "SELECT * FROM users WHERE email = ?";

  db.query(
    sql,
    [email],
    async (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json({
          success: false
        });

      }

      if (result.length === 0) {

        return res.status(401).json({
          success: false,
          message: "User not found"
        });

      }

      const user = result[0];

      const match =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!match) {

        return res.status(401).json({
          success: false,
          message: "Wrong password"
        });

      }

      req.session.userId = user.id;

      res.json({
        success: true,
        message: "Login Successful",
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      });

    }
  );

});

app.post("/register", async (req, res) => {

  const { name, email, password } = req.body;

  try {

    const hashedPassword = await bcrypt.hash(password, 10);

    console.log("Original:", password);
    console.log("Hashed:", hashedPassword);

    const sql =
      "INSERT INTO users (name,email,password) VALUES (?,?,?)";

    db.query(
      sql,
      [name, email, hashedPassword],
      (err, result) => {

        if (err) {
          console.log(err);

          return res.status(500).json({
            success: false
          });
        }

        res.json({
          success: true,
          message: "User Registered"
        });

      }
    );

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success: false
    });

  }

});

app.post("/generate-exam", async (req, res) => {

  try {

    if (!req.session.userId) {

      return res.status(401).json({
        error: "Please login first"
      });

    }

    const { difficulty } = req.body;

    const aiResponse =
      await generateIELTSQuestions(
        difficulty
      );

    const content =
  aiResponse.choices?.[0]?.message?.content;

if (!content) {
  console.log("AI RESPONSE WAS:");
  console.log(JSON.stringify(aiResponse, null, 2));

  throw new Error("AI returned no content");
}

const cleanContent = content.trim();

    console.log("===== AI CONTENT =====");
    console.log(cleanContent);
    console.log("======================");

    const jsonMatch =
      cleanContent.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      console.log("RAW AI CONTENT:");
      console.log(cleanContent);
      throw new Error(
        "No JSON found in AI response"
      );

    }

    const questions =
      JSON.parse(jsonMatch[0]);

    res.json(questions);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "AI generation failed"
    });

  }

});

app.get("/dashboard", (req, res) => {

  if (!req.session.userId) {

    return res.status(401).json({
      success: false,
      message: "Please Login"
    });

  }

  res.json({
    success: true,
    message: "Welcome to Dashboard"
  });

});

app.post("/grade-exam", async (req, res) => {

  try {

    if (!req.session.userId) {

      return res.status(401).json({
        error: "Please login first"
      });

    }

    const { questions, answers, difficulty } = req.body;

    const aiResponse = await gradeExam(
      questions,
      answers
    );

    const content =
      aiResponse.choices[0]
        .message.content
        .trim();

    console.log("GRADE RESPONSE");
    console.log(content);

    const jsonMatch =
      content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {

      throw new Error(
        "No JSON found in AI response"
      );

    }

    const result =
      JSON.parse(jsonMatch[0]);

    // SAVE RESULT TO DATABASE HERE

    await db.promise().query(
      `INSERT INTO exam_results
       (
         user_id,
         reading,
         writing,
         listening,
         speaking,
         overall,
         feedback,
         difficulty
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.userId,
        result.reading,
        result.writing,
        result.listening,
        result.speaking,
        result.overall,
        result.feedback,
        difficulty
      ]
    );

    // SEND RESULT TO FRONTEND

    res.json(result);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: "Grading failed"
    });

  }

});

app.get("/exam-history", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({
        error: "Please login first"
      });
    }

    const [rows] = await db
      .promise()
      .query(
        `SELECT *
         FROM exam_results
         WHERE user_id = ?
         ORDER BY created_at DESC`,
        [req.session.userId]
      );

    res.json(rows);

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Failed to load exam history"
    });
  }
});

app.listen(3000, () => {
  console.log("Server Started");
});