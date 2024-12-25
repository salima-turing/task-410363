const fs = require('fs');
const { performance } = require('perf_hooks');

async function readFileAsync(filePath) {
    return new Promise((resolve, reject) => {
        const startTime = performance.now();
        fs.readFile(filePath, 'utf-8', (err, data) => {
            if (err) reject(err);
            const endTime = performance.now();
            const duration = endTime - startTime;
            console.log(`Reading file ${filePath} took ${duration.toFixed(2)} ms`);
            resolve(data);
        });
    });
}

// Example usage
(async () => {
    try {
        const filePath = '/path/to/large/file.txt';
        await readFileAsync(filePath);
    } catch (err) {
        console.error('Error reading file:', err);
    }
})();
