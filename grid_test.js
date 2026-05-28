async function run() {
    const { Jimp } = await import('jimp');
    const img = await Jimp.read('C:/Users/konus/.gemini/antigravity-ide/brain/0e0b2f3c-3093-44dd-bad6-0d8e8ce9904c/media__1779812352017.png');
    
    const halfWidth = Math.floor(img.width / 2);
    const rightRadiator = img.clone().crop({
        x: halfWidth,
        y: 0,
        w: img.width - halfWidth,
        h: img.height
    });
    
    // Draw vertical red lines every 10 pixels
    for (let x = 0; x < rightRadiator.width; x += 10) {
        for (let y = 0; y < rightRadiator.height; y++) {
            rightRadiator.setPixelColor(0xFF0000FF, x, y);
        }
    }
    
    await rightRadiator.write('assets/grid_test.png');
    console.log('Grid test image saved to assets/grid_test.png');
}
run().catch(console.error);
