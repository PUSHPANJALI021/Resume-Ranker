const express = require('express');
const router = express.Router();
const db = require('../db');
const { scoreResume } = require('../controllers/scoreResume');

// Run screening for all candidates against a JD
router.post('/run', async (req, res) => {
  try {
    const { jdId } = req.body;

    if (!jdId) {
      return res.status(400).json({ error: 'jdId is required' });
    }

    // Get the JD
    const jdResult = await db.query(
      'SELECT content FROM job_descriptions WHERE id = $1',
      [jdId]
    );

    if (jdResult.rows.length === 0) {
      return res.status(404).json({ error: 'Job description not found' });
    }

    const jdText = jdResult.rows[0].content;

    // Get all candidates
    const candidates = await db.query(
      'SELECT id, raw_text FROM candidates'
    );

    if (candidates.rows.length === 0) {
      return res.status(400).json({ error: 'No candidates found. Upload resumes first.' });
    }

    // Score each candidate
    for (const candidate of candidates.rows) {
      const result = await scoreResume(candidate.raw_text, jdText);

      await db.query(
        `UPDATE candidates 
         SET name = $1, email = $2, score = $3,
             matched_skills = $4, missing_skills = $5, summary = $6
         WHERE id = $7`,
        [
          result.name,
          result.email,
          result.score,
          result.matched_skills,
          result.missing_skills,
          result.summary,
          candidate.id
        ]
      );
    }

    // Assign ranks based on score
    const ranked = await db.query(
      'SELECT id FROM candidates ORDER BY score DESC'
    );

    for (let i = 0; i < ranked.rows.length; i++) {
      await db.query(
        'UPDATE candidates SET rank = $1 WHERE id = $2',
        [i + 1, ranked.rows[i].id]
      );
    }

    res.json({
      success: true,
      message: `Screening complete! ${candidates.rows.length} candidates ranked.`
    });

  } catch (err) {
    console.error('Screening error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get ranked results
router.get('/results', async (req, res) => {
  try {
    const data = await db.query(
      'SELECT * FROM candidates ORDER BY rank ASC NULLS LAST'
    );
    res.json(data.rows);
  } catch (err) {
    console.error('Results error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Clear all candidates (for fresh screening)
router.delete('/clear', async (req, res) => {
  try {
    await db.query('DELETE FROM candidates');
    await db.query('DELETE FROM job_descriptions');
    res.json({ success: true, message: 'All data cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;