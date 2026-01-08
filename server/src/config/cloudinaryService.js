const cloudinary = require('./cloudinary');

const uploadToCloudinary = async (fileBuffer, folder) => {
    console.log(`[CloudinaryService] Iniciando stream de upload para pasta: ${folder}`);

    if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
        console.error('[CloudinaryService] Erro: Buffer de arquivo inválido ou ausente.');
        throw new Error('Buffer de arquivo inválido');
    }

    return new Promise((resolve, reject) => {
        try {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: `inscreva-se/${folder}`,
                    resource_type: 'auto' // Detectar se é imagem ou pdf
                },
                (error, result) => {
                    if (error) {
                        console.error('[CloudinaryService] Erro retornado pelo Cloudinary:', error);
                        reject(error);
                    } else {
                        console.log('[CloudinaryService] Sucesso!', result.secure_url);
                        resolve(result);
                    }
                }
            );

            uploadStream.on('error', (err) => {
                console.error('[CloudinaryService] Erro no Stream:', err);
                reject(err);
            });

            uploadStream.end(fileBuffer);
        } catch (err) {
            console.error('[CloudinaryService] Erro catch síncrono:', err);
            reject(err);
        }
    });
};

module.exports = { uploadToCloudinary };
