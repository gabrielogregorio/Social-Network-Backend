const multerImage = require('multer');
const path = require('path');
const fs = require('fs')

module.exports = (multerImage({
  storage: multerImage.diskStorage({

    destination: (req, file, cb) => {
      fs.mkdirSync('./public/images/clients', { recursive: true })
      cb(null, './public/images/clients');
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