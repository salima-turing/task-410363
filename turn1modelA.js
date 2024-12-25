const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');

let currentGrainSize = 1024 * 1024; // Start with 1 MB granularity

async function readFileInChunks(filePath) {
    const stats = fs.statSync(filePath);
    const fileSize = stats.size;
    const stream = fs.createReadStream(filePath, { highWaterMark: currentGrainSize });

    let chunks = [];

    for await (const chunk of stream) {
        chunks.push(chunk);
        console.log(`Read a chunk of size: ${chunk.length}`);
        adjustGrainSize();
    }

    return Buffer.concat(chunks);
}

// Function to adjust the current grain size based on performance metrics
function adjustGrainSize() {
    // Here you would implement logic to monitor performance and adjust grain size
    // For demo, let's use a very simplistic approach based on mock performance
    const startTime = performance.now();

    // Simulate processing time
    setTimeout(() => {
        const endTime = performance.now();
        const duration = endTime - startTime;

        if (duration < 100) { // If processing for the chunk was fast
            currentGrainSize = Math.min(currentGrainSize * 2, 10 * 1024 * 1024); // Cap at 10 MB
        } else { // If slow, reduce the chunk size
            currentGrainSize = Math.max(currentGrainSize / 2, 1024 * 1024); // No smaller than 1 MB
        }

        console.log(`Adjusted grain size to: ${currentGrainSize}`);
    }, 1); // Simulating async I/O with setTimeout
}

// Example of processing multiple files
async function processFiles(directory) {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        const fullPath = path.join(directory, file);
        const buffer = await readFileInChunks(fullPath);
        // Further processing can occur here...
        console.log(`Processed file: ${file} with total size: ${buffer.length}`);
    }
}

// Start processing files from a chosen directory
const directoryPath = './data';
processFiles(directoryPath).then(() => {
    console.log('All files processed');
}).catch(console.error);
