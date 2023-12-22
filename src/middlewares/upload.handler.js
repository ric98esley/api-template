const multer = require('multer');
const path = require('path');
const mime = require('mime-types');

const upload = multer({
  storage: multer.diskStorage({
    destination: '/tmp/uploads',
    filename: function (req, file, cb) {
      let ext = path.extname(file.originalname);
      ext = ext.length > 1 ? ext : '.' + mime.extension(file.mimetype);
      const uniqueSuffix =
        Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
      cb(null, file.fieldname + '-' + uniqueSuffix);
    },
  }),
});

module.exports = { upload };
