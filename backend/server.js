const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const path = require('path');
const uuid = require('uuid');
const cors = require('cors');
require('dotenv').config();

const serviceAccount = {
  type: process.env.SERVICE_ACCOUNT_TYPE,
  project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
  private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
  private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'), // handle line breaks in the private key
  client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
  client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
  auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
  token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_CERT_URL,
  client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_CERT_URL,
  universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN
};

const app = express();
const port = 5001;

// CORS Setup
app.options('*', cors({
  origin: 'https://designbuddy-1.onrender.com', // Frontend domain
  methods: 'GET,POST,PUT,DELETE',
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true,
}));
app.use(cors());

// Initialize Google Cloud Storage
const storage = new Storage({
  credentials: serviceAccount // Optional if using environment variable
});
const bucket = storage.bucket('financeur-24f2e.appspot.com');

// Multer setup for file upload
const multerStorage = multer.memoryStorage();
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // limit the file size to 10MB
}).array('images', 3); // Expect an array of 'images' with a max of 3 files

const sanitizeFileName = (fileName) => {
  return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
};

app.post('/upload', upload, async (req, res) => {
  try {
    const { files, body } = req;
    const { thoughtProcess = "", resultAchieved = "" } = body;

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded.' });
    }

    // Handle each file
    const uploadPromises = files.map(async (file) => {
      const sanitizedFileName = sanitizeFileName(file.originalname);
      const fileName = `${uuid.v4()}_${sanitizedFileName}`;
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        contentType: file.mimetype,
      });

      return new Promise((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error('File upload error:', err);
          reject(new Error('Failed to upload file to Google Cloud Storage.'));
        });
        blobStream.on('finish', () => resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`));
        blobStream.end(file.buffer);
      });
    });

    const imageUrls = await Promise.all(uploadPromises);
    console.log(imageUrls, "Uploaded Image URLs");

    // Build the prompt
    let imageSections = imageUrls.map((url) => ({
      type: "image_url",
      image_url: { "url": url }
    }));

    const prompt = `
      Please create a detailed design case study using the following information:\n\n
      1. Designer's thought process: ${thoughtProcess}\n\n
      2. Achieved results: ${resultAchieved}\n\n
      3. Design screenshots: Attached in the prompt\n\n
      Please structure the case study in a clear, logical flow. Also, write a section on what is present in the images.
    `;

    // Build messages for OpenAI request with dynamic images
    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: `${prompt}` },
          ...imageSections
        ]
      },
    ];

    // Call OpenAI API with image URLs and other data
    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o-mini',
        messages: messages,
        max_tokens: 3000,
        temperature: 0.7
      }, {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your OpenAI API key
          'Content-Type': 'application/json',
        },
      });

      const caseStudyText = response.data.choices[0].message.content.trim();
      return res.status(200).json({ imageUrls, caseStudyText });

    } catch (error) {
      console.error('OpenAI API call error:', error.message);
      return res.status(500).json({ error: 'Failed to generate case study using OpenAI API.' });
    }
  } catch (error) {
    console.error('File upload error:', error.message);
    return res.status(500).json({ error: 'An unexpected error occurred during file upload.' });
  }
});

// Handle undefined routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// Global error handler (if any unhandled error occurs)
app.use((err, req, res, next) => {
  console.error('Global error handler:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
