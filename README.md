# AI IELTS Practice Platform

## Project Title

**AI IELTS Practice Platform**

## Project Objective

The objective of this project is to develop a full-stack web application that helps students practice IELTS exam sections using artificial intelligence to randomly generate the mock exam questions within the parameters (difficulty, section) the user can set. The platform allows users to register, log in, generate IELTS-style mock practice questions, complete different IELTS sections, receive AI-generated feedback, and review their scores through history and dashboard pages.

The system is designed to support practice for:

* Reading
* Writing
* Listening
* Speaking

Students can choose to complete a full mock exam or practice specific sections individually.

## Main Features

* User registration and login
* Protected pages for logged-in users
* Full IELTS mock exam mode
* Section-specific practice mode
* AI-generated IELTS-style questions
* Reading multiple-choice questions
* Writing task practice
* Listening audio playback with pause and resume
* Speaking interview-style practice
* AI grading and feedback
* IELTS-style band score estimate
* Raw score display such as `x/y`
* Exam review after submission
* Exam history page
* Dashboard with performance statistics
* Modern responsive frontend design



### Frontend

* React
* Vite
* React Router
* Axios
* Bootstrap
* Custom CSS

### Backend

* Node.js
* Express.js
* Axios
* Express Session
* Bcrypt
* Dotenv
* MySQL2

### Database

* MySQL

### AI API

* Hugging Face Router API

## AI Model Used

The project uses the following AI model through the Hugging Face Router API:

```text
Qwen/Qwen3-8B
```

The AI model is used for:

1. Generating IELTS-style practice questions
2. Estimating question difficulty
3. Grading student answers
4. Providing IELTS-style feedback and band score estimates

## Project Structure

```text
ai-ielts-platform/
  backend/
    database/
      db.js
    server.js
    package.json
    .env.example

  frontend/
    src/
      components/
      pages/
      App.jsx
      main.jsx
      styles.css
    package.json

  ielts_ai.sql
  README.md
```

## Running Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
cd YOUR_REPO_NAME
```

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with the actual GitHub repository details.

## Backend Setup

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Create `.env` File

Inside the `backend` folder, create a file named:

```text
.env
```

Use `.env.example` as a guide.

Example:

```env
HF_TOKEN=your_huggingface_token_here

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password_here
DB_NAME=ielts_ai

SESSION_SECRET=ielts-secret-key
```

Important: Do not upload the `.env` file to GitHub because it contains private keys and passwords.

## Database Setup

### 4. Create and Import the MySQL Database

Make sure MySQL is installed and running.

Open MySQL:

```bash
mysql -u root -p
```

Then run:

```sql
DROP DATABASE IF EXISTS ielts_ai;
CREATE DATABASE ielts_ai;
exit;
```

Import the database file from the main project folder:

```bash
mysql -u root -p ielts_ai < ielts_ai.sql
```

For Windows PowerShell, if the `<` import command does not work, use Command Prompt or run:

```bash
cmd /c "mysql -u root -p ielts_ai < ielts_ai.sql"
```

## Run the Backend

Inside the `backend` folder, run:

```bash
node server.js
```

The backend will run on:

```text
http://localhost:3000
```

Keep this terminal open.

## Frontend Setup

Open a new terminal window.

```bash
cd frontend
npm install
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

Open this link in a browser.

## How to Use the Application

1. Open the website.
2. Register a new account.
3. Log in.
4. Choose a practice mode:

   * Full Exam
   * Reading
   * Writing
   * Listening
   * Speaking
5. Generate the exam.
6. Complete the questions.
7. Submit the exam.
8. View the IELTS-style band score estimate.
9. Review the completed exam.
10. Check the History and Dashboard pages.
11. Log out when finished.

## Important Notes

* The IELTS scores are practice estimates and are not official IELTS results.
* A valid Hugging Face token is required for AI question generation and grading.
* MySQL must be running before registering, logging in, or saving exam results.
* The backend must be running before using the frontend.
* Do not upload `.env` or `node_modules` to GitHub.

## Files That Should Not Be Uploaded

The `.gitignore` file should include:

```gitignore
node_modules
.env
.DS_Store
```

## Group Members

* Daniel Aung
* Richard Seinsu

