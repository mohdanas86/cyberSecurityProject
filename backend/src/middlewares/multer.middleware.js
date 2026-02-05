import multer from 'multer';

// Set up multer for file uploads
const storage = multer.diskStorage({
  // Destination folder for uploaded files
  destination: function (req, file, cb) {
    cb(null, './public/temp');
  },
  // Set the filename for uploaded files
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

// Export the configured multer upload middleware
export const upload = multer({
  storage,
});
