const fs = require('fs');

function analyzeFile(filePath) {
    console.log(`\n--- Analyzing ${filePath} ---`);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check for JSON validity first
    try {
        const json = JSON.parse(content);
        console.log("JSON is valid.");

        const dashboard = json.dashboard;
        if (dashboard) {
            console.log("Dashboard key exists.");
            console.log("- Type of dashboard:", typeof dashboard);
            if (typeof dashboard === 'object') {
                console.log("- Dashboard children keys:", Object.keys(dashboard).slice(0, 5).join(', '), "...");
                console.log("- Has ads:", !!dashboard.ads);
                console.log("- Has usersList:", !!dashboard.usersList);
                if (dashboard.usersList) {
                    console.log("- usersList type:", typeof dashboard.usersList);
                }
            }
        } else {
            console.log("Dashboard key MISSING at root.");
        }
    } catch (e) {
        console.log("JSON is INVALID:", e.message);
    }

    // Manual line check for duplicates
    const lines = content.split('\n');
    lines.forEach((line, i) => {
        if (line.includes('"dashboard":')) {
            console.log(`Line ${i + 1}: ${line.trim()}`);
        }
    });
}

analyzeFile('src/messages/en.json');
analyzeFile('src/messages/pt.json');
