import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
// Import all the necessary functions from your upload module
import { upload, getFileUrl, deleteFile } from './upload.js'; 

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
// This route handles the image upload.
app.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was uploaded. Please select a JPG or PNG file.' });
  }

  // Use the getFileUrl function to construct the URL
  const fileUrl = getFileUrl(req.file.filename);
  
  res.status(200).json({
    message: 'File uploaded successfully!',
    url: fileUrl,
    filename: req.file.filename // Send filename back to client for delete requests
  });
});

// --- API Endpoint for File Deletion ---
// This route handles deleting a specific file.
// It uses a route parameter ':filename' to know which file to delete.
app.delete('/delete/:filename', (req, res) => {
    const { filename } = req.params;
    
    // Call the deleteFile function from your upload module
    const wasDeleted = deleteFile(filename);

    if (wasDeleted) {
        res.status(200).json({ message: `File ${filename} deleted successfully.`});
    } else {
        res.status(404).json({ error: `File ${filename} not found or could not be deleted.` });
    }
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
