# AI IELTS Practice Platform

A full-stack IELTS practice website using React, Express, MySQL, and the Hugging Face Router API.

## Features

- User registration, login, logout, and protected pages
- Full IELTS-style practice exam or individual section practice
- Reading passages with clickable multiple-choice questions
- Listening script played as audio while questions remain visible
- Writing Task 1 and Task 2, including real HTML tables when data is generated
- Speaking interview/cue-card/discussion practice with speech recognition transcript
- Upload or paste your own mock questions to detect difficulty and generate similar practice
- IELTS-style grading, feedback, score summary, and full exam review
- Dashboard and exam history

## Setup

### 1. Backend environment

Create `backend/.env` from `backend/.env.example`:

```env
HF_TOKEN=your_huggingface_token_here
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ielts_ai
SESSION_SECRET=change_this_to_any_random_secret
```

### 2. Database

Import the database:

```bash
mysql -u root -p < ielts_ai.sql
```

### 3. Backend

```bash
cd backend
npm install
node server.js
```

Backend runs on `http://localhost:3000`.

### 4. Frontend

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Notes

- Do not commit `.env` or `node_modules`.
- Scores are IELTS-style practice scores, not official IELTS results.
