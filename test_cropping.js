const fs = require('fs');

async function analyzeAndGetBBox(imgPath) {
    const { Jimp } = await import('jimp');
    const image = await Jimp.read(imgPath);
    const width = image.width;
    const height = image.height;
    
    // Visited array for BFS
    const visited = new Uint8Array(width * height);
    const queue = [];
    
    // Add borders to queue
    for (let x = 0; x < width; x++) {
        queue.push({x, y: 0}); visited[x] = 1;
        queue.push({x, y: height - 1}); visited[(height - 1) * width + x] = 1;
    }
    for (let y = 1; y < height - 1; y++) {
        queue.push({x: 0, y}); visited[y * width] = 1;
        queue.push({x: width - 1, y}); visited[y * width + (width - 1)] = 1;
    }
    
    let head = 0;
    while (head < queue.length) {
        const {x, y} = queue[head++];
        const color = image.getPixelColor(x, y);
        const r = (color >> 24) & 0xff;
        const g = (color >> 16) & 0xff;
        const b = (color >> 8) & 0xff;
        const a = color & 0xff;
        
        if (a === 0) continue;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        const diff = max - min;
        
        // Match white/gray background
        const isBg = (diff <= 15) && (r > 200);
        
        if (isBg) {
            image.setPixelColor(0x00000000, x, y);
            const neighbors = [
                {x: x + 1, y}, {x: x - 1, y},
                {x, y: y + 1}, {x, y: y - 1}
            ];
            for (const n of neighbors) {
                if (n.x >= 0 && n.x < width && n.y >= 0 && n.y < height) {
                    const idx = n.y * width + n.x;
                    if (!visited[idx]) {
                        visited[idx] = 1;
                        queue.push(n);
                    }
                }
            }
        }
    }
    
    // Find bounding box of remaining non-transparent pixels
    let minY = height, maxY = 0, minX = width, maxX = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = image.getPixelColor(x, y);
            const a = color & 0xff;
            if (a !== 0) {
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
            }
        }
    }
    
    const bboxWidth = maxX - minX;
    const bboxHeight = maxY - minY;
    console.log(`${imgPath}:`);
    console.log(`  BBox: x=${minX}..${maxX}, y=${minY}..${maxY}`);
    console.log(`  Width: ${bboxWidth}, Height: ${bboxHeight}`);
    console.log(`  Aspect Ratio (W/H): ${(bboxWidth / bboxHeight).toFixed(3)}`);
}

async function run() {
    // Generate left half first
    const { Jimp } = await import('jimp');
    const img = await Jimp.read('C:/Users/konus/.gemini/antigravity-ide/brain/0e0b2f3c-3093-44dd-bad6-0d8e8ce9904c/media__1779812352017.png');
    const halfWidth = Math.floor(img.width / 2);
    const leftRadiator = img.clone().crop({
        x: 0,
        y: 0,
        w: halfWidth,
        h: img.height
    });
    await leftRadiator.write('assets/radiator_left_half.png');
    
    await analyzeAndGetBBox('assets/radiator_left_half.png');
    await analyzeAndGetBBox('assets/radiator_right_half.png');
}

run().catch(console.error);
