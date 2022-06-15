const router = require('express').Router();
const path = require('path');
const express = require('express');
const asyncHandler = require('express-async-handler');
const multer = require('multer');

const storage = multer.diskStorage({
  destination(req, file, callback) {
    callback(null, path.resolve(__dirname, '../../uploads'));
  },
  filename(req, file, callback) {
    callback(null, `${Date.now()}_${file.originalname}`);
  },
});
const fileUploader = multer({ storage }).single('file');
const auth = require('../auth');

router.post('/', auth.required, fileUploader, asyncHandler(async (req, res, next) => {
  /*
    #swagger.tags = ["upload"]
    #swagger.consumes = ['multipart/form-data']
    #swagger.parameters['file'] = {
      in: 'formData',
      type: 'file',
      required: 'true',
      description: 'Файл изображения',
    }
    #swagger.responses[200] = {
      schema: {
        "url": "/api/v1/upload/images/1655283962721_filename.png"
      }
    }
  */
  const { file } = req;
  // TODO: Add file type validation and error handling
  return res.json({ url: `${req.originalUrl}images/${file.filename}` });
}));
// #swagger.start
/*
     #swagger.tags = ["upload"]
     #swagger.path = '/upload/image/{filename}'
     #swagger.method = 'get'
     #swagger.description = 'Получение загруженного изображения'
     #swagger.produces = ['application/json']
     #swagger.parameters['filename'] = {
         in: 'path',
         type: 'integer',
         description: 'Имя изображения' }
*/
// #swagger.end
router.use('/images', express.static(path.resolve(__dirname, '../../uploads')));
module.exports = router;
