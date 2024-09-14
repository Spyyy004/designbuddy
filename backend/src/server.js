const express = require('express');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const axios = require('axios');
const path = require('path');
const uuid = require('uuid');
const cors = require('cors');
const { type } = require('os');
require('dotenv').config();

const app = express();
const port = 5001;
app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['POST'],
  }));

// Initialize Google Cloud Storage
const storage = new Storage({
    keyFilename: path.join(__dirname, 'service_account2.json') // Optional if using environment variable
  });
const bucket = storage.bucket('financeur-24f2e.appspot.com');

// Multer setup for file upload
const multerStorage = multer.memoryStorage(); // or diskStorage
const upload = multer({
  storage: multerStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // limit the file size to 10MB
}).array('images', 3); // Expect an array of 'images' with a max of 3 files

const sanitizeFileName = (fileName) => {
    // Replace spaces with underscores and remove any other potentially problematic characters
    return fileName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
  };

  app.post('/upload', upload, async (req, res) => {
    try {
      const { files, body } = req;
      const { thoughtProcess = "", resultAchieved = "" } = body;
  
      if (!files || files.length === 0) {
        return res.status(400).send('No files uploaded.');
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
          blobStream.on('error', reject);
          blobStream.on('finish', () => resolve(`https://storage.googleapis.com/${bucket.name}/${fileName}`));
          blobStream.end(file.buffer);
        });
      });
  
      const imageUrls = await Promise.all(uploadPromises);
      console.log(imageUrls, "Uploaded Image URLs");
  
      // Build the prompt
      let imageSections = imageUrls.map((url, index) => ({
        type: "image_url",
        image_url: { "url": url }
      }));
  
      const prompt = `
        Please create a detailed design case study using the following information:\n\n
        1. Designer's thought process: ${thoughtProcess}\n\n
        2. Achieved results: ${resultAchieved}\n\n
        3. Design screenshots: Attached in the prompt\n\n
        In your case study, please include:\n\n- 
        An introduction explaining the project's context and goals\n- A breakdown of the design problem and challenges faced\n- An analysis of the designer's approach and methodology\n- A description of the design process, including any iterations or pivotal decisions\n- An explanation of how the final design addresses the initial problems\n- A visual analysis of the design, referencing the provided image URLs\n- A summary of the results and impact of the design\n- Any lessons learned or insights gained from the project\n\n
        Please structure the case study in a clear, logical flow, using headings and subheadings where appropriate. Aim for a comprehensive yet engaging narrative that showcases both the designer's process and the effectiveness of the final product. Also, write a section on what is present in the images.
      `;
  
      // Build messages for OpenAI request with dynamic images
      const messages = [
        {
          role: 'user',
          content: [
            {
                type:'text',
                text : `${prompt}`
            },
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
  
        return res.json({ imageUrls, caseStudyText }).status(200);
  
      } catch (error) {
        console.error('OpenAI API call error:', error);
        res.status(500).send('Failed to generate case study.');
      }
    } catch (error) {
      console.error('File upload error:', error.message);
      res.status(500).send('Failed to upload file.');
    }
  });
  

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

