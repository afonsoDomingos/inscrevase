import https from 'https';
import http from 'http';

const SITE_URL = 'https://inscreva-se.com';
const SITEMAP_URL = `${SITE_URL}/sitemap.xml`;

// -----------------------------------------------
// 1. Ping the sitemap to Google and Bing
// -----------------------------------------------
function ping(url) {
    return new Promise((resolve, reject) => {
        const client = url.startsWith('https') ? https : http;
        const req = client.get(url, (res) => {
            resolve({ status: res.statusCode, url });
        });
        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error(`Timeout pinging: ${url}`));
        });
    });
}

// -----------------------------------------------
// 2. Main
// -----------------------------------------------
async function main() {
    const targets = [
        // Google Sitemap Ping
        `https://www.google.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
        // Bing Sitemap Ping  
        `https://www.bing.com/ping?sitemap=${encodeURIComponent(SITEMAP_URL)}`,
    ];

    console.log('🚀 Notificando motores de busca sobre o sitemap...');
    console.log(`📄 Sitemap: ${SITEMAP_URL}\n`);

    for (const target of targets) {
        try {
            const result = await ping(target);
            const engine = target.includes('google') ? 'Google' : 'Bing';
            const status = result.status === 200 ? '✅' : '⚠️';
            console.log(`${status} ${engine}: HTTP ${result.status}`);
        } catch (err) {
            const engine = target.includes('google') ? 'Google' : 'Bing';
            console.error(`❌ ${engine}: ${err.message}`);
        }
    }

    console.log('\n✅ Notificação de sitemap concluída!');
}

main();
