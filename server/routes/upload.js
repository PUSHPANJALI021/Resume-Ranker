const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

// Create uploads folder if it doesn't exist
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
const { parseFile } = require('../controllers/parseResume');

// Configure file storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// File filter - only allow PDF, DOC, DOCX
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, DOCX files are allowed'), false);
  }
};

const upload = multer({ storage, fileFilter });

// Upload multiple resumes
router.post('/resumes', upload.array('resumes', 20), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    const parsed = [];

    for (const file of req.files) {
      const text = await parseFile(file.path, file.mimetype);

      const result = await db.query(
        'INSERT INTO candidates (file_name, file_path, raw_text) VALUES ($1, $2, $3) RETURNING id',
        [file.originalname, file.path, text]
      );

      parsed.push({
        id: result.rows[0].id,
        fileName: file.originalname
      });
    }

    res.json({
      success: true,
      message: `${parsed.length} resume(s) uploaded successfully`,
      files: parsed
    });

  } catch (err) {
    console.error('Upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Upload or manually enter JD
router.post('/jd', upload.single('jd'), async (req, res) => {
  try {
    let jdText = '';

    if (req.file) {
      // JD uploaded as file
      jdText = await parseFile(req.file.path, req.file.mimetype);
    } else if (req.body.text) {
      // JD entered manually
      jdText = req.body.text;
    } else {
      return res.status(400).json({ error: 'No JD provided' });
    }

    const result = await db.query(
      'INSERT INTO job_descriptions (content) VALUES ($1) RETURNING id',
      [jdText]
    );

    res.json({
      success: true,
      jdId: result.rows[0].id,
      preview: jdText.slice(0, 300)
    });

  } catch (err) {
    console.error('JD upload error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;