const fs = require('fs');
const { performance, PerformanceObserver } = require('perf_hooks');
const path = require('path');

// Performance Observer to log performance entries
const obs = new PerformanceObserver((list) => {
    list.getEntries().forEach((entry) => {
        console.log(`${entry.name}: ${entry.duration.toFixed(2)} ms`);
    });
});
obs.observe({ entryTypes: ['measure'] });

async function readLargeFile(filePath) {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;

    // Start measuring the performance
    performance.mark('start-read');

    // Read file
    const data = await fs.promises.readFile(filePath);
    
    // End measuring the performance
    performance.mark('end-read');
    performance.measure('File Read', 'start-read', 'end-read');

    console.log(`Read ${fileSize} bytes from ${filePath}`);
    return data;
}

async function processFiles(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const filePath = path.join(directory, file);
        await readLargeFile(filePath);
    }
}

// Example usage
const directoryPath = '/path/to/large/files';
processFiles(directoryPath).then(() => {
    console.log('File processing completed.');
}).catch(console.error);
