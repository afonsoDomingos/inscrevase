const express = require('express');
const router = express.Router();
const multer = require('multer');
const { uploadToCloudinary } = require('../config/cloudinaryService');
const { authMiddleware } = require('../middleware/authMiddleware');
const fs = require('fs');
const path = require('path');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Usamos .any() para debugar e permitir qualquer nome de campo (ex: 'file', 'image', etc)
router.post('/', upload.any(), async (req, res) => {
    try {
        console.log('--- Início de Upload (Debug Mode) ---');
        console.log('Body:', req.body);
        console.log('Files received:', req.files?.length || 0);

        if (!req.files || req.files.length === 0) {
            console.error('Nenhum arquivo detectado pelo Multer');
            fs.appendFileSync(path.join(process.cwd(), 'upload-debug.log'), `${new Date().toISOString()} - Erro: Nenhum arquivo detectado\n`);
            return res.status(400).json({ message: 'Nenhum arquivo enviado' });
        }

        // Pega o primeiro arquivo enviado, independente do nome do campo
        const file = req.files[0];
        const folder = req.body.folder || 'general';

        console.log(`Subindo: ${file.originalname} (${file.size} bytes) para pasta: ${folder}`);
        fs.appendFileSync(path.join(process.cwd(), 'upload-debug.log'), `${new Date().toISOString()} - Recebido: ${file.originalname} (${file.size} bytes)\n`);

        const result = await uploadToCloudinary(file.buffer, folder);
        console.log('Sucesso Cloudinary:', result.secure_url);

        res.json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (err) {
        console.error('Erro no Upload Controller:', err);
        const errorMsg = `${new Date().toISOString()} - CRITICAL ERROR: ${err.message}\nStack: ${err.stack}\n`;
        fs.appendFileSync(path.join(process.cwd(), 'upload-debug.log'), errorMsg);
        res.status(500).json({
            message: 'Upload failed',
            error: err.message,
            debug_info: 'Verifique upload-debug.log no servidor'
        });
    }
});

module.exports = router;
