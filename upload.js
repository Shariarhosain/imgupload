import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// --- Directory Setup ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the directory where uploads will be stored
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure the upload directory exists, create it if it doesn't
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log(`Created upload directory at: ${UPLOAD_DIR}`);
} else {
  console.log(`Upload directory already exists at: ${UPLOAD_DIR}`);
}


// --- Multer Storage Configuration ---
// This tells multer where and how to save the files.
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // The destination is our 'uploads' directory
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // To avoid name collisions, we create a unique filename.
    // It's composed of the original fieldname, a timestamp, a random number, and the original extension.
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + extension);
  },
});

// --- Multer File Filter ---
// This function checks if the uploaded file is of an allowed type.
const fileFilter = (req, file, cb) => {
  // Define allowed file extensions/mimetypes
  const allowedTypes = /jpeg|jpg|png/;
  
  // Test the file's mimetype and original extension
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    // If it's an allowed type, accept the file
    return cb(null, true);
  }
  
  // If not, reject the file with an error message
  cb(new Error('Error: File upload only supports the following filetypes - ' + allowedTypes), false);
};

// --- Multer Initialization ---
// We combine the storage, limits, and file filter into the final multer instance.
const upload = multer({
  storage: storage,
  limits: { fileSize: 2.5 * 1024 * 1024 }, // 2.5MB file size limit
  fileFilter: fileFilter,
});

// Export the configured multer instance for use in our server routes
export { upload };
