import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Directory Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where uploads will be stored
// Note: This goes one level up from the current directory and then into 'uploads'
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure the upload directory exists, create it if it doesn't
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory at: ${UPLOAD_DIR}`);
}

// --- Multer Storage Configuration ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

// --- Multer File Filter ---
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Error: File upload only supports the following filetypes - ' + allowedTypes), false);
};

// --- Multer Initialization ---
const upload = multer({
  storage: storage,
  limits: { fileSize: 2.5 * 1024 * 1024 }, // 2.5MB
  fileFilter: fileFilter,
});

// --- Helper Functions ---

/**
 * Constructs the full public URL for a given filename.
 * @param {string} filename - The name of the file in the uploads directory.
 * @returns {string} The full URL to the file.
 */
const getFileUrl = (filename) => {
  // This function assumes the server is running on localhost:3000.
  // In a production environment, you would use environment variables for the base URL.
  return `http://localhost:3000/uploads/${filename}`;
};

/**
 * Deletes a file from the upload directory.
 * @param {string} filename - The name of the file to delete.
 * @returns {boolean} True if deletion was successful, otherwise false.
 */
const deleteFile = (filename) => {
    const filePath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Successfully deleted ${filePath}`);
            return true;
        } catch (err) {
            console.error(`Error deleting file ${filePath}:`, err);
            return false;
        }
    } else {
        console.warn(`File not found, cannot delete: ${filePath}`);
        return false;
    }
};

// --- Exports ---
// Make sure to export all the functions and variables needed by other files.
export { upload, getFileUrl, deleteFile, UPLOAD_DIR };
