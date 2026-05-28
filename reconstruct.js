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
    
    // We want to reconstruct the clean panels on the left side of the right radiator.
    // The radiator body starts around x = 110 (inside the 512px half image).
    // The brackets are on the left (x = 20 to 110).
    // The cutaway is roughly from x = 110 to x = 280, y = 200 to 550.
    // The clean panels on the right are from x = 280 to x = 450.
    
    // Let's copy the clean panels from the right side (e.g. from x = 290 to x = 430)
    // and paste them over the left side (from x = 140 to x = 280).
    // We can do this in vertical columns to match the panel lines.
    
    // Let's create a clone to modify
    const cleanImg = rightRadiator.clone();
    
    // Let's copy a strip of width 140px from the right side and paste it over the left side.
    // Source: x = 290, width = 140. Destination: x = 150.
    const srcX = 290;
    const destX = 150;
    const width = 140;
    const height = rightRadiator.height;
    
    // Copy pixels from source to destination
    for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
            // Only overwrite pixels in the cutaway area to preserve the outline and shading at the edges
            // The cutaway is roughly between y = 220 and y = 570.
            if (y > 200 && y < 580) {
                const color = rightRadiator.getPixelColor(srcX + x, y);
                cleanImg.setPixelColor(color, destX + x, y);
            }
        }
    }
    
    await cleanImg.write('assets/reconstructed_test.png');
    console.log('Reconstructed test image saved.');
}
run().catch(console.error);
