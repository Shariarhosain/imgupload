import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { upload } from './upload.js'; // Import the upload middleware

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// --- Static File Serving ---
// Serve the frontend (the HTML file)
app.use(express.static(path.join(__dirname, 'public')));
// Serve the uploaded files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- API Endpoint for File Upload ---
// This route handles the image upload. The `upload.single('image')` middleware
// processes a single file uploaded in the 'image' field of the form.
app.post('/upload', upload.single('image'), (req, res) => {
  // If multer middleware fails or no file is uploaded, req.file will be undefined.
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded. Please select a JPG or PNG file.' });
  }

  // Construct the full URL for the uploaded file.
  // It combines the server protocol, host, and the path to the file.
  
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  
  // Send the URL back to the client in a JSON response.
  res.status(200).json({
    message: 'File uploaded successfully!',
    url: fileUrl,
  });
});

// --- Error Handling ---
// A simple catch-all for other routes that don't exist
app.use((req, res) => {
    res.status(404).send("Sorry, can't find that!");
});

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
