const router = require('express').Router();
const { uploadMultiple, uploadZip } = require('../controllers/codeUploadController');
const { upload } = require('../services/uploadService');

router.post('/uploadFiles', upload.array('files'), uploadMultiple)
router.post('/uploadZip', upload.single('file'), uploadZip)

module.exports = router;