const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      let uploadDir = './uploads/';
      let fullPath = path.join(__dirname, '..', uploadDir);
      if (file.fieldname === 'profilePhoto') {
        uploadDir = './uploads/teacherUploads/profilePhotos/';
        fullPath = path.join(__dirname, '../', uploadDir);
      } else if (file.fieldname === 'degreeCertificates') {
        uploadDir = './uploads/teacherUploads/degreeCertificates/';
        fullPath = path.join(__dirname, '../', uploadDir);
      } else if (file.fieldname === 'idProof') {
        uploadDir = './uploads/teacherUploads/idProofs/';
        fullPath = path.join(__dirname, '../', uploadDir);
      } else if (file.fieldname === 'thumbnail' && req.originalUrl.includes('/courses')) {
        uploadDir = './uploads/courseThumbs/';
        fullPath = path.join(__dirname, '../', uploadDir);
      } else if (file.fieldname === 'video' && req.originalUrl.includes('/lectures')) {
        uploadDir = './uploads/lectures/'; // Directory for lecture videos
        fullPath = path.join(__dirname, '../', uploadDir);
      } else if (file.fieldname === 'notes' && req.originalUrl.includes('/lectures')) {
        uploadDir = './uploads/lectures/notes/'; // Directory for lecture notes
        fullPath = path.join(__dirname, '../', uploadDir);
      } else if(file.fieldname === 'poster') {
        uploadDir = './uploads/workshopPosters/';
        fullPath = path.join(__dirname, '../', uploadDir);
      }

      
      await fs.mkdir(fullPath, { recursive: true });
      cb(null, fullPath);
    } catch (err) {
      console.err("Multer destination error: ", err);
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (req, file, cb) => {
  console.log("inside fileFilter");

  if (file.fieldname === 'thumbnail' && !file.mimetype.startsWith('image/')) {
    console.log("Invalid thumbnail type");
    return cb(null, false);
  }

  if (file.fieldname === 'video' && !file.mimetype.startsWith('video/')) {
    console.log("Invalid video type");
    return cb(null, false);
  }

  if (file.fieldname === 'notes' && file.mimetype !== 'application/pdf') {
    console.log("Invalid notes type");
    return cb(null, false);
  }

  if (file.fieldname === 'poster' && !file.mimetype.startsWith('image/')) {
    console.log("Invalid poster type - must be an image");
    return cb(new Error('Only image files are allowed for posters'), false);
  }
  console.log(`Accepted file type: ${file.mimetype}`);
  cb(null, true); // ✅ Only one cb
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter,
});

const uploadLecture = upload.fields([
  { name: 'video', maxCount: 1 },
  { name: 'notes', maxCount: 1 },
]);
module.exports = upload;