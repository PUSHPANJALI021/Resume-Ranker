 🏆 Resume Ranker

An AI-powered resume screening platform that ranks candidates against a job description using Gemini AI.

---

##  Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | PostgreSQL (Neon) |
| AI | Google Gemini API |
| File Parsing | pdf-parse + mammoth |
| Deployment | Vercel (frontend) + Render (backend) |

---

## 📂 Project Structure

```
Resume_Ranker/
│
├── client/                        # React frontend
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Upload + JD input
│   │   │   └── Results.jsx        # Rankings dashboard
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/                        # Express backend
│   ├── controllers/
│   │   └── parseResume.js         # PDF/DOCX text extraction
│   ├── routes/
│   │   ├── upload.js              # Resume + JD upload routes
│   │   └── screening.js          # AI screening route
│   ├── uploads/                   # Temporary file storage
│   ├── db.js                      # Neon PostgreSQL connection
│   ├── index.js                   # Express server entry point
│   └── package.json
│
└── README.md
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- A [Neon](https://neon.tech) account (free)
- A [Google AI Studio](https://aistudio.google.com) account (free)

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/resume-ranker.git
cd resume-ranker
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
DATABASE_URL=postgresql://username:password@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require
GEMINI_API_KEY=AIzaSyxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
PORT=5000
```

Start the backend:

```bash
npm run dev
```

Expected output:
```
Server running on port 5000
Database connected successfully!
```

---

### 3. Frontend Setup

```bash
cd client
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

### 4. Database Setup

Run this SQL in your [Neon SQL Editor](https://console.neon.tech):

```sql
CREATE TABLE candidates (
  id SERIAL PRIMARY KEY,
  file_name TEXT,
  file_path TEXT,
  raw_text TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE job_descriptions (
  id SERIAL PRIMARY KEY,
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE analyses (
  id SERIAL PRIMARY KEY,
  candidate_id INT REFERENCES candidates(id),
  jd_id INT REFERENCES job_descriptions(id),
  overall_score INT,
  technical_score INT,
  experience_score INT,
  education_score INT,
  missing_skills JSONB,
  strengths JSONB,
  improvements JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔄 How It Works

```
User uploads resumes (PDF/DOCX)
        ↓
Backend extracts text (pdf-parse / mammoth)
        ↓
Text saved to PostgreSQL (Neon)
        ↓
User pastes Job Description
        ↓
Gemini AI scores each resume vs JD
        ↓
Results ranked and displayed on dashboard
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload/resumes` | Upload PDF/DOCX resumes |
| POST | `/api/upload/jd` | Submit job description |
| POST | `/api/screen/run` | Run AI screening |
| GET | `/api/screen/results/:jdId` | Fetch ranked results |

---

## 🤖 AI Scoring (Gemini)

Each resume is scored against the job description and returns:

```json
{
  "overall_score": 88,
  "technical_score": 92,
  "experience_score": 85,
  "education_score": 80,
  "missing_skills": ["Docker", "AWS"],
  "strengths": ["Strong React experience", "Good project portfolio"],
  "improvements": ["Add cloud experience", "Quantify achievements"]
}
```
## 📦 Dependencies

### Backend
```
express, cors, dotenv, multer
pdf-parse, mammoth
@google/genai
pg
nodemon (dev)
```

### Frontend
```
react, react-dom, vite
tailwindcss
axios
react-dropzone
lucide-react
recharts
```

---

## 🛠️ Troubleshooting

| Problem | Fix |
|---------|-----|
| `Database connected` then crash | Neon free tier suspends after inactivity — use `Pool` not `Client` |
| `uploads/` folder missing error | The folder is auto-created on server start |
| Button does nothing | Check browser console (F12) for errors |
| CORS error | Make sure `app.use(cors())` is in `server/index.js` |
| Gemini returns no response | Check `GEMINI_API_KEY` in `.env` |

---

<img width="769" height="509" alt="image" src="https://github.com/user-attachments/assets/882dbf33-57cf-4795-bbd4-c405a77eec54" />


