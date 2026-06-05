const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scoreResume(resumeText, jdText) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
You are an expert HR recruiter and resume analyst.
Carefully analyze the resume against the job description below.

JOB DESCRIPTION:
${jdText}

RESUME:
${resumeText}

Return ONLY a valid JSON object. No markdown, no backticks, no extra text.
{
  "name": "candidate full name or Unknown",
  "email": "email address or null",
  "score": <number between 0 and 100>,
  "matched_skills": ["skill1", "skill2", "skill3"],
  "missing_skills": ["skill1", "skill2", "skill3"],
  "summary": "2-3 sentence evaluation of this candidate"
}

Scoring breakdown:
- Skills match: 40%
- Experience relevance: 30%
- Education alignment: 20%
- Keyword similarity: 10%
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();

    // Clean response in case model adds backticks
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return parsed;

  } catch (err) {
    console.error('Scoring error:', err.message);
    throw err;
  }
}

module.exports = { scoreResume };