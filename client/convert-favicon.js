const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const inputFile = path.join(__dirname, 'public', 'logo-original.png');
const publicDir = path.join(__dirname, 'public');
const appDir = path.join(__dirname, 'src', 'app');

async function convertFavicon() {
    try {
        console.log('🔄 Converting favicon...');

        // Read the original image
        const image = sharp(inputFile);
        const metadata = await image.metadata();
        console.log(`📐 Original image: ${metadata.width}x${metadata.height}`);

        // Generate favicon.ico (32x32 and 16x16 combined)
        console.log('🎨 Creating favicon.ico...');
        await image
            .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(publicDir, 'favicon.ico'));

        await image
            .resize(32, 32, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .toFile(path.join(appDir, 'favicon.ico'));

        // Generate icon-192x192.png
        console.log('🎨 Creating icon-192x192.png...');
        await image
            .resize(192, 192, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(publicDir, 'icon-192x192.png'));

        // Generate icon-512x512.png
        console.log('🎨 Creating icon-512x512.png...');
        await image
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(publicDir, 'icon-512x512.png'));

        // Generate logo.png (512x512)
        console.log('🎨 Creating logo.png...');
        await image
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(publicDir, 'logo.png'));

        // Generate icon.png for app directory
        console.log('🎨 Creating icon.png for app directory...');
        await image
            .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(appDir, 'icon.png'));

        // Generate apple-icon.png for app directory
        console.log('🎨 Creating apple-icon.png for app directory...');
        await image
            .resize(180, 180, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
            .png()
            .toFile(path.join(appDir, 'apple-icon.png'));

        // Generate og-image.png
        console.log('🎨 Creating og-image.png...');
        await image
            .resize(1200, 630, { fit: 'contain', background: { r: 20, g: 82, b: 173, alpha: 1 } })
            .png()
            .toFile(path.join(publicDir, 'og-image.png'));

        console.log('✅ All favicons generated successfully!');
        console.log('\n📁 Generated files:');
        console.log('  - public/favicon.ico');
        console.log('  - public/icon-192x192.png');
        console.log('  - public/icon-512x512.png');
        console.log('  - public/logo.png');
        console.log('  - public/og-image.png');
        console.log('  - src/app/favicon.ico');
        console.log('  - src/app/icon.png');
        console.log('  - src/app/apple-icon.png');

    } catch (error) {
        console.error('❌ Error converting favicon:', error);
        process.exit(1);
    }
}

convertFavicon();
