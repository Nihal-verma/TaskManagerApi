import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const fileExtension = path.extname(file.originalname); 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9); 
    cb(null, file.fieldname + '-' + uniqueSuffix + fileExtension); 
  }
});

export const upload = multer({ storage: storage });
