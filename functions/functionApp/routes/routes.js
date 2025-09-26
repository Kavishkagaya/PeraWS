const router = require('express').Router();
const { json } = require('express');
const { uploadMultiple, uploadZip } = require('../controllers/codeUploadController');
const { invokeNodeFunction } = require('../controllers/dispatchController');
const { upload } = require('../services/uploadService');

router.post('/uploadFiles', upload.array('files'), uploadMultiple)
router.post('/uploadZip', upload.single('file'), uploadZip)

router.post("/invoke/node/:name", json(), invokeNodeFunction)

module.exports = router;