import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
// Import all the necessary functions from your upload module
import { upload, getFileUrl, deleteFile, UPLOAD_DIR } from './upload.js'; 

// --- Basic Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;

// --- Static File Serving ---
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Multer configuration for multiple file types ---
const listingUpload = upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'sub_images', maxCount: 10 }
]);

// --- API Endpoint to List All Images ---
app.get('/images', (req, res) => {
    fs.readdir(UPLOAD_DIR, (err, files) => {
        if (err) {
            console.error("Could not list the directory.", err);
            return res.status(500).json({ error: 'Failed to list images.' });
        }

        const imageFiles = files.filter(file => /\.(jpg|jpeg|png)$/i.test(file));
        const imageUrls = imageFiles.map(filename => getFileUrl(filename));

        res.status(200).json(imageUrls);
    });
});

// --- API Endpoint for Multiple File Upload ---
app.post('/upload', listingUpload, (req, res) => {
    if (!req.files || (!req.files.main_image && !req.files.sub_images)) {
        return res.status(400).json({ error: 'No files were uploaded.' });
    }

    const response = {
        message: 'Files uploaded successfully!',
        main_image: null,
        sub_images: []
    };

    // Process main image
    if (req.files.main_image && req.files.main_image[0]) {
        const mainFile = req.files.main_image[0];
        response.main_image = {
            url: getFileUrl(mainFile.filename),
            filename: mainFile.filename
        };
    }

    // Process sub images
    if (req.files.sub_images) {
        response.sub_images = req.files.sub_images.map(file => ({
            url: getFileUrl(file.filename),
            filename: file.filename
        }));
    }

    res.status(200).json(response);
});

// --- API Endpoint for File Deletion ---
app.delete('/delete/:filename', (req, res) => {
    const { filename } = req.params;
    
    const wasDeleted = deleteFile(filename);

    if (wasDeleted) {
        res.status(200).json({ message: `File ${filename} deleted successfully.`});
    } else {
        res.status(404).json({ error: `File ${filename} not found or could not be deleted.` });
    }
});

// --- Error Handling ---
app.use((req, res) => {
    res.status(404).send("Sorry, can't find that!");
});

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
