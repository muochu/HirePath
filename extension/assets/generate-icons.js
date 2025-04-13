/**
 * Generate PNG icons from SVG at different sizes
 * Run with: node generate-icons.js
 * 
 * Requirements:
 * npm install sharp
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Icon sizes needed for Chrome extension
const sizes = [16, 48, 128];

// Source SVG file
const svgFile = path.join(__dirname, 'icon.svg');

// Check if SVG exists
if (!fs.existsSync(svgFile)) {
  console.error('Source SVG file not found:', svgFile);
  process.exit(1);
}

// Read SVG file
const svgBuffer = fs.readFileSync(svgFile);

// Generate icons for each size
async function generateIcons() {
  for (const size of sizes) {
    const outputFile = path.join(__dirname, `icon${size}.png`);
    
    try {
      await sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(outputFile);
      
      console.log(`✅ Generated ${size}x${size} icon: ${outputFile}`);
    } catch (error) {
      console.error(`❌ Error generating ${size}x${size} icon:`, error);
    }
  }
}

// Run the generator
generateIcons().then(() => {
  console.log('Icon generation complete! 🎉');
}).catch(err => {
  console.error('Error during icon generation:', err);
}); 