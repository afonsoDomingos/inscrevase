const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinaryService');
const { authMiddleware } = require('../middleware/authMiddleware');

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', authMiddleware, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const folder = req.body.folder || 'general';
        const result = await uploadToCloudinary(req.file.buffer, folder);

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (err) {
        res.status(500).json({ message: 'Upload failed', error: err.message });
    }
});

module.exports = router;
