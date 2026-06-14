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
app.use(express.json({ limit: "3mb" }));
app.use(
  session({
    secret: process.env.SESSION_SECRET || "ielts-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false,
      httpOnly: true,
      sameSite: "lax"
    }
  })
);

const HF_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = process.env.HF_MODEL || "Qwen/Qwen3-8B";
const VALID_SECTIONS = ["reading", "writing", "listening", "speaking"];

app.get("/", (req, res) => {
  res.send("Server Running");
});

const callHuggingFace = async (messages, options = {}) => {
  if (!process.env.HF_TOKEN) {
    throw new Error("HF_TOKEN is missing from backend .env file");
  }

  const response = await axios.post(
    HF_URL,
    {
      model: HF_MODEL,
      messages,
      max_tokens: options.max_tokens || 4500,
      temperature: options.temperature ?? 0.55
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.HF_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;
};

const extractJson = (aiResponse) => {
  const content = aiResponse.choices?.[0]?.message?.content;

  if (!content) {
    console.log("AI RESPONSE WAS:");
    console.log(JSON.stringify(aiResponse, null, 2));
    throw new Error("AI returned no content");
  }

  const cleanContent = content.trim();
  const jsonMatch = cleanContent.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    console.log("RAW AI CONTENT:");
    console.log(cleanContent);
    throw new Error("No JSON found in AI response");
  }

  return JSON.parse(jsonMatch[0]);
};

const normalizeSections = (sections) => {
  if (!sections || sections === "full") return VALID_SECTIONS;

  if (typeof sections === "string") {
    return VALID_SECTIONS.includes(sections) ? [sections] : VALID_SECTIONS;
  }

  if (Array.isArray(sections)) {
    const filtered = sections.filter((section) => VALID_SECTIONS.includes(section));
    return filtered.length > 0 ? filtered : VALID_SECTIONS;
  }

  return VALID_SECTIONS;
};

const roundToHalf = (score) => Math.round(Number(score || 0) * 2) / 2;

const bandFromScaledOutOf40 = (scaledScore, skill = "listening") => {
  const score = Math.max(0, Math.min(40, Number(scaledScore) || 0));

  // Practice conversion based on IELTS-style raw marks out of 40.
  // IELTS states Listening and Reading are marked as 40 raw marks, converted to 9-band scores.
  // Exact conversion can vary by test version, so this app reports a practice estimate.
  const listeningScale = [
    [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7],
    [26, 6.5], [23, 6], [18, 5.5], [16, 5], [13, 4.5],
    [10, 4], [7, 3.5], [5, 3], [3, 2.5], [1, 2], [0, 0]
  ];

  const readingScale = [
    [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7],
    [27, 6.5], [23, 6], [19, 5.5], [15, 5], [13, 4.5],
    [10, 4], [8, 3.5], [6, 3], [4, 2.5], [1, 2], [0, 0]
  ];

  const scale = skill === "reading" ? readingScale : listeningScale;
  const match = scale.find(([minimum]) => score >= minimum);
  return match ? match[1] : 0;
};

const scaledRawOutOf40 = (correct, total) => {
  if (!total) return 0;
  return Math.round((Number(correct) / Number(total)) * 40);
};

const normalizeAnswer = (value) => String(value || "").trim().toLowerCase();

const autoMarkObjectiveSection = (questions, answers, skill) => {
  const items = questions?.[skill] || [];
  let total = 0;
  let correct = 0;
  const details = [];

  items.forEach((item, itemIndex) => {
    (item.questions || []).forEach((question, questionIndex) => {
      if (!question.correctAnswer) return;

      const answerKey = `${skill}-${itemIndex}-${questionIndex}`;
      const userAnswer = answers[answerKey];
      const expected = question.correctAnswer;
      total += 1;

      const isCorrect = normalizeAnswer(userAnswer) === normalizeAnswer(expected);
      if (isCorrect) correct += 1;

      details.push({
        id: question.id || answerKey,
        prompt: question.prompt,
        userAnswer: userAnswer || "",
        correctAnswer: expected,
        isCorrect
      });
    });
  });

  if (total === 0) return null;

  const scaledOutOf40 = scaledRawOutOf40(correct, total);
  const band = bandFromScaledOutOf40(scaledOutOf40, skill);

  return {
    total,
    correct,
    rawScoreLabel: `${correct}/${total}`,
    scaledOutOf40,
    band,
    details
  };
};

async function generateIELTSQuestions(difficulty, sectionsInput, sourceText = "") {
  const sections = normalizeSections(sectionsInput);
  const sourceInstruction = sourceText
    ? `\nThe student uploaded this mock exam or practice material. First infer its difficulty, style, question type and topic focus, then generate NEW practice questions for only the requested sections at a similar difficulty. Do not copy the original text directly. Uploaded material:\n${sourceText.slice(0, 6000)}\n`
    : "";

  const prompt = `
Generate a polished IELTS-style online mock practice exam.

Requested difficulty: ${difficulty}
Requested sections only: ${sections.join(", ")}
${sourceInstruction}
Return ONLY valid JSON. Do not include markdown or explanations outside JSON.

Use this exact JSON structure. Include ONLY the requested section arrays. If a section is not requested, return it as an empty array.

{
  "meta": {
    "title": "IELTS Mock Practice",
    "difficulty": "${difficulty}",
    "sections": ${JSON.stringify(sections)},
    "estimatedTime": "...",
    "sourceBased": ${sourceText ? "true" : "false"},
    "detectedDifficulty": "${difficulty}"
  },
  "reading": [
    {
      "id": "reading-1",
      "title": "...",
      "difficulty": "${difficulty}",
      "instructions": "Read the passage and answer the questions.",
      "passage": "Write a coherent passage of 8 to 14 sentences. It should feel like an IELTS Academic practice passage, not a childish paragraph.",
      "questions": [
        {
          "id": "reading-1-q1",
          "type": "mcq",
          "prompt": "...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctAnswer": "A. ..."
        }
      ]
    }
  ],
  "writing": [
    {
      "id": "writing-1",
      "title": "Writing Task 1",
      "difficulty": "${difficulty}",
      "taskType": "Academic Task 1",
      "instructions": "Write at least 150 words.",
      "prompt": "...",
      "table": {
        "title": "...",
        "headers": ["...", "..."],
        "rows": [["...", "..."], ["...", "..."]]
      }
    },
    {
      "id": "writing-2",
      "title": "Writing Task 2",
      "difficulty": "${difficulty}",
      "taskType": "Essay",
      "instructions": "Write at least 250 words.",
      "prompt": "..."
    }
  ],
  "listening": [
    {
      "id": "listening-1",
      "title": "...",
      "difficulty": "${difficulty}",
      "instructions": "Listen to the recording and answer the questions.",
      "audioScript": "Write a realistic IELTS listening script of 10 to 16 sentences. It may be a conversation or short talk.",
      "questions": [
        {
          "id": "listening-1-q1",
          "type": "mcq",
          "prompt": "...",
          "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
          "correctAnswer": "A. ..."
        }
      ]
    }
  ],
  "speaking": [
    {
      "id": "speaking-1",
      "title": "Speaking Part 1",
      "difficulty": "${difficulty}",
      "part": "Part 1 Interview",
      "instructions": "Answer naturally in 2 to 4 sentences.",
      "prompt": "..."
    },
    {
      "id": "speaking-2",
      "title": "Speaking Part 2",
      "difficulty": "${difficulty}",
      "part": "Part 2 Cue Card",
      "instructions": "Speak for 1 to 2 minutes.",
      "prompt": "Describe ...",
      "bulletPoints": ["You should say ...", "...", "...", "and explain ..."]
    },
    {
      "id": "speaking-3",
      "title": "Speaking Part 3",
      "difficulty": "${difficulty}",
      "part": "Part 3 Discussion",
      "instructions": "Give a developed answer with reasons and examples.",
      "prompt": "..."
    }
  ]
}

Generation rules:
- Follow the IELTS skill layout: Listening, Reading, Writing and Speaking are separate skills.
- This is a shorter online practice mock, not a full official 40-question IELTS paper. Still make it feel realistic and exam-like.
- For Reading, create 1 original passage with 10 to 15 sentences and exactly 8 questions. At least 6 questions must be MCQ with four options. The rest may be short answer or sentence completion.
- Reading passage should have an academic/informational style for medium/hard, and a simpler factual style for easy.
- For Listening, create 1 realistic audio script with 12 to 18 sentences and exactly 8 questions. At least 6 questions must be MCQ with four options. The rest may be short answer.
- Listening should be a realistic conversation, announcement, campus/service scenario, or short educational talk.
- For Writing, create Task 1 and Task 2. Task 1 should include a real table object whenever you mention data, numbers, a chart, a comparison, a process, or survey results.
- Writing Task 1 should request at least 150 words. Writing Task 2 should request at least 250 words.
- For Speaking, create 4 items total: Part 1 interview, Part 2 cue card, and 2 Part 3 discussion questions.
- MCQ options must be clickable-friendly and must include the exact correct option string in correctAnswer.
- Do not make options too obvious. Use plausible distractors.
- Do not include copyrighted IELTS passages. Create original material only.
- Do not use placeholders.
- Make spacing and labels clean.
- Do not generate unrequested sections.
- Return valid JSON only.
`;

  const response = await callHuggingFace(
    [
      {
        role: "system",
        content:
          "You are a professional IELTS examiner and test designer. You create original IELTS-style practice tasks in strict JSON only."
      },
      {
        role: "user",
        content: prompt
      }
    ],
    { max_tokens: 5200, temperature: 0.55 }
  );

  return response.data ? response.data : response;
}

async function gradeExam(questions, answers, sectionsInput) {
  const sections = normalizeSections(sectionsInput || questions?.meta?.sections);
  const readingMark = sections.includes("reading") ? autoMarkObjectiveSection(questions, answers, "reading") : null;
  const listeningMark = sections.includes("listening") ? autoMarkObjectiveSection(questions, answers, "listening") : null;

  const response = await callHuggingFace(
    [
      {
        role: "system",
        content:
          "You are a certified IELTS examiner. Grade with IELTS-style band descriptors. Return only valid JSON."
      },
      {
        role: "user",
        content: `
Grade this IELTS-style mock practice exam.

Requested sections: ${sections.join(", ")}

Questions:
${JSON.stringify(questions, null, 2)}

Student answers:
${JSON.stringify(answers, null, 2)}

Objective auto-marking from MCQ questions:
${JSON.stringify({ reading: readingMark, listening: listeningMark }, null, 2)}

Return ONLY valid JSON in this structure:
{
  "reading": null,
  "writing": null,
  "listening": null,
  "speaking": null,
  "overall": 0,
  "feedback": "",
  "sectionFeedback": {
    "reading": "",
    "writing": "",
    "listening": "",
    "speaking": ""
  },
  "reviewTips": ["...", "...", "..."],
  "bandExplanation": ""
}

Rules:
- Only score requested sections. Unrequested sections must be null.
- For Reading and Listening, use the objective auto-marking when available. Do not override the objective score.
- For Writing, evaluate task achievement/task response, coherence and cohesion, lexical resource, and grammatical range/accuracy.
- For Speaking, evaluate fluency and coherence, lexical resource, grammatical range/accuracy, and pronunciation-related clarity based on transcript.
- Overall is the average of only requested section scores, rounded to the nearest 0.5 band.
- Use bands from 0 to 9.
- Be constructive, specific, and concise.
- This is a practice mock score, not an official IELTS result.
`
      }
    ],
    { max_tokens: 2500, temperature: 0.25 }
  );

  const result = extractJson(response);

  if (readingMark) result.reading = readingMark.band;
  if (listeningMark) result.listening = listeningMark.band;

  const scoredSections = sections
    .map((section) => Number(result[section]))
    .filter((score) => !Number.isNaN(score));

  result.overall = scoredSections.length
    ? roundToHalf(scoredSections.reduce((sum, score) => sum + score, 0) / scoredSections.length)
    : 0;

  const objectiveCorrect = [readingMark, listeningMark]
    .filter(Boolean)
    .reduce((sum, mark) => sum + mark.correct, 0);
  const objectiveTotal = [readingMark, listeningMark]
    .filter(Boolean)
    .reduce((sum, mark) => sum + mark.total, 0);

  result.autoMarked = {
    reading: readingMark,
    listening: listeningMark
  };

  result.scoreSummary = {
    bandScore: `${result.overall}/9`,
    objectiveScore: objectiveTotal ? `${objectiveCorrect}/${objectiveTotal}` : "N/A",
    objectiveCorrect,
    objectiveTotal,
    explanation: objectiveTotal
      ? "Reading and Listening MCQs are marked as raw correct answers, then scaled to an IELTS-style band estimate. Writing and Speaking are examiner-style AI assessed."
      : "Writing and Speaking are examiner-style AI assessed. Reading/Listening raw scores appear when MCQs are included."
  };

  result.sections = sections;
  result.notice = "Practice IELTS-style score. This is not an official IELTS result.";

  return result;
}

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: "Email and password are required" });
  }

  const sql = "SELECT * FROM users WHERE email = ? LIMIT 1";

  db.query(sql, [email.trim().toLowerCase()], async (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Login failed" });
    }

    if (result.length === 0) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    const user = result[0];
    let match = false;

    try {
      if (String(user.password || "").startsWith("$2")) {
        match = await bcrypt.compare(password, user.password);
      } else {
        match = password === user.password;
      }
    } catch (error) {
      console.log(error);
      match = false;
    }

    if (!match) {
      return res.status(401).json({ success: false, message: "Wrong password" });
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
  });
});

app.post("/register", async (req, res) => {
  const name = String(req.body.name || "").trim();
  const email = String(req.body.email || "").trim().toLowerCase();
  const password = String(req.body.password || "");

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Name, email, and password are required" });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
  }

  try {
    const [existingUsers] = await db.promise().query(
      "SELECT id FROM users WHERE email = ? LIMIT 1",
      [email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ success: false, message: "This email is already registered. Please login instead." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.promise().query(
      "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({ success: true, message: "User Registered" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Registration failed" });
  }
});

app.post("/generate-exam", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    const { difficulty = "medium", sections = "full" } = req.body;
    const requestedSections = normalizeSections(sections);
    const aiResponse = await generateIELTSQuestions(difficulty, requestedSections);
    const questions = extractJson(aiResponse);

    questions.meta = questions.meta || {};
    questions.meta.sections = requestedSections;
    questions.meta.difficulty = difficulty;

    VALID_SECTIONS.forEach((section) => {
      if (!requestedSections.includes(section)) {
        questions[section] = [];
      } else if (!Array.isArray(questions[section])) {
        questions[section] = [];
      }
    });

    res.json(questions);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "AI generation failed" });
  }
});

app.post("/analyze-upload", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    const { section = "reading", content = "" } = req.body;
    const selectedSection = VALID_SECTIONS.includes(section) ? section : "reading";

    if (!content.trim()) {
      return res.status(400).json({ error: "Uploaded content is empty" });
    }

    const difficultyResponse = await callHuggingFace(
      [
        {
          role: "system",
          content: "You are an IELTS examiner. Identify difficulty and question style from uploaded practice material. Return only valid JSON."
        },
        {
          role: "user",
          content: `Analyze this IELTS-style material for the ${selectedSection} section. Return JSON only: {"estimatedDifficulty":"easy|medium|hard","reason":"...","questionFocus":"..."}. Material:\n${content.slice(0, 6000)}`
        }
      ],
      { max_tokens: 900, temperature: 0.2 }
    );

    const analysis = extractJson(difficultyResponse);
    const detectedDifficulty = ["easy", "medium", "hard"].includes(analysis.estimatedDifficulty)
      ? analysis.estimatedDifficulty
      : "medium";

    const generatedResponse = await generateIELTSQuestions(detectedDifficulty, [selectedSection], content);
    const practiceExam = extractJson(generatedResponse);
    practiceExam.meta = practiceExam.meta || {};
    practiceExam.meta.sections = [selectedSection];
    practiceExam.meta.difficulty = detectedDifficulty;
    practiceExam.meta.detectedDifficulty = detectedDifficulty;
    practiceExam.meta.sourceBased = true;

    VALID_SECTIONS.forEach((skill) => {
      if (skill !== selectedSection) practiceExam[skill] = [];
      if (!Array.isArray(practiceExam[skill])) practiceExam[skill] = [];
    });

    res.json({ analysis, practiceExam });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Upload analysis failed" });
  }
});

app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "Please Login" });
  }

  res.json({ success: true, message: "Welcome to Dashboard" });
});

app.post("/grade-exam", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    const { questions, answers, difficulty, sections } = req.body;
    const result = await gradeExam(questions, answers, sections);

    await db.promise().query(
      `INSERT INTO exam_results
       (user_id, reading, writing, listening, speaking, overall, feedback, difficulty)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.session.userId,
        result.reading,
        result.writing,
        result.listening,
        result.speaking,
        result.overall,
        result.feedback,
        difficulty || questions?.meta?.difficulty || "mixed"
      ]
    );

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Grading failed" });
  }
});

app.get("/exam-history", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    const [rows] = await db.promise().query(
      `SELECT *
       FROM exam_results
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.session.userId]
    );

    res.json(rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to load exam history" });
  }
});

app.get("/dashboard-stats", async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Please login first" });
    }

    const [rows] = await db.promise().query(
      `SELECT *
       FROM exam_results
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [req.session.userId]
    );

    if (rows.length === 0) {
      return res.json({
        totalExams: 0,
        averageScore: 0,
        bestScore: 0,
        latestDifficulty: "None"
      });
    }

    const totalExams = rows.length;
    const validOverallScores = rows.map((row) => Number(row.overall)).filter((score) => !Number.isNaN(score));
    const bestScore = Math.max(...validOverallScores);
    const averageScore = (
      validOverallScores.reduce((sum, score) => sum + score, 0) / validOverallScores.length
    ).toFixed(2);
    const latestDifficulty = rows[0].difficulty || "Unknown";

    res.json({ totalExams, averageScore, bestScore, latestDifficulty });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to load dashboard stats" });
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy((error) => {
    if (error) {
      return res.status(500).json({ error: "Logout failed" });
    }

    res.clearCookie("connect.sid");
    res.json({ message: "Logged out successfully" });
  });
});

app.get("/check-session", (req, res) => {
  if (req.session.userId) {
    return res.json({ loggedIn: true, userId: req.session.userId });
  }

  res.status(401).json({ loggedIn: false });
});

app.listen(3000, () => {
  console.log("Server Started");
});
