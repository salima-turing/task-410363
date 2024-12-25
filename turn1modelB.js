const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const fs = require('fs');
const path = require('path');
const os = require("node:os");

const filePath = path.join(__dirname, 'data/data.txt'); // Replace with your large file
const initialGrainSize = 1024 * 1024; // 1 MB initial grain size

function processChunk(chunk) {
    // Simulate processing time
    const processingTime = Math.random() * 100; // Random processing time between 0 and 100 ms
    setTimeout(() => {
        // Calculate the actual processing time for reporting
        const actualProcessingTime = Date.now() - startTime;
        // Send the processing time back to the main thread
        parentPort.postMessage({ type: 'completed', grainSize: grainSize, time: actualProcessingTime });
    }, processingTime);
}

if (isMainThread) {
    const fileSize = fs.statSync(filePath).size;
    let numWorkers = os.cpus().length;
    let grainSize = initialGrainSize;

    let tasks = [];
    let totalProcessingTime = 0;

    function startProcessing() {
        for (let i = 0; i < fileSize; i += grainSize) {
            const end = Math.min(i + grainSize, fileSize);
            const chunk = fs.createReadStream(filePath, { start, end });
            const worker = new Worker(__filename, { workerData: { chunk, grainSize } });

            worker.on('message', (message) => {
                if (message.type === 'completed') {
                    totalProcessingTime += message.time;
                    adjustGrainSize(message.time);
                    tasks.splice(tasks.indexOf(worker), 1);
                    if (tasks.length === 0 && totalProcessingTime > 0) {
                        console.log(`Average processing time: ${totalProcessingTime / tasks.length} ms`);
                        console.log(`Adjusted grain size: ${grainSize} bytes`);
                    }
                }
            });

            worker.on('error', (error) => {
                console.error('Worker error:', error);
            });

            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error('Worker exited with code:', code);
                }
            });

            tasks.push(worker);
        }
    }

    function adjustGrainSize(processingTime) {
        // Simple heuristic: Increase grain size if processing time is low, decrease otherwise
        if (processingTime < 50) {
            grainSize = Math.min(grainSize * 2, 1024 * 1024 * 10); // Max 10 MB
        } else if (processingTime > 100) {
            grainSize = Math.max(grainSize / 2, initialGrainSize);
        }
    }

    startProcessing();
} else {
    const { chunk, grainSize } = workerData;
    const startTime = Date.now();

    chunk.on('data', (data) => {
        processChunk(data);
    });

    chunk.on('end', () => {
        parentPort.postMessage({ type: 'completed', grainSize, time: Date.now() - startTime });
    });

    chunk.on('error', (error) => {
        parentPort.postMessage({ type: 'error', error });
    });
}
