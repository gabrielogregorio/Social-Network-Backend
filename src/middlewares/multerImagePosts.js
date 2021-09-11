const multerImage = require('multer');
const path = require('path');

module.exports = (multerImage({
  storage: multerImage.diskStorage({

    destination: (req, file, cb) => {
      cb(null, './public/images/posts');
    },
    filename: (req, file, cb) => {
      let extension = path.extname(file.originalname)
      
      cb(null, file.fieldname + '-' + Date.now() + extension) 
    }
  }),

  fileFilter: (req, file, cb) => {
    const accepted = ['image/gif', 'image/png', 'image/webp', 'image/jpg', 'image/jpeg'].find(aceito => aceito == file.mimetype );

    if(accepted){
      return cb(null, true); // Aceitar arquivo
    }
    return cb(null, false); // Rejeitar arquivo
  }
}));