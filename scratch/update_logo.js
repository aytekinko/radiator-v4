import { Jimp } from 'jimp';

async function updateLogo() {
    console.log('Reading source JPEG image...');
    const srcPath = 'C:/Users/konus/.gemini/antigravity-ide/brain/e4d888c5-5a78-4107-9d68-c06c39b19d6f/media__1779918581430.jpg';
    const destPath = 'c:/Users/konus/.gemini/antigravity-ide/scratch/radiator-reiniger/assets/logo.png';
    const faviconPath = 'c:/Users/konus/.gemini/antigravity-ide/scratch/radiator-reiniger/favicon.png';
    
    const image = await Jimp.read(srcPath);
    console.log(`Loaded image: ${image.width}x${image.height}`);
    
    // Save as logo.png
    await image.write(destPath);
    console.log(`Saved logo to ${destPath}`);
    
    // Resize for favicon and save as favicon.png
    const faviconImage = image.clone().resize({ w: 64, h: 64 });
    await faviconImage.write(faviconPath);
    console.log(`Saved favicon to ${faviconPath}`);
}

updateLogo().catch(console.error);
