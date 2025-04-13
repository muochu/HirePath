const fs = require('fs');
const { exec } = require('child_process');

// Check if ImageMagick is installed
exec('which convert', (error) => {
  if (error) {
    console.error('ImageMagick is not installed. Please install it or use another method to convert SVG to PNG.');
    return;
  }

  const sizes = [192, 512];
  
  sizes.forEach(size => {
    const command = `convert -background none public/logo.svg -resize ${size}x${size} public/logo${size}.png`;
    
    exec(command, (err, stdout, stderr) => {
      if (err) {
        console.error(`Error generating logo${size}.png:`, err);
        return;
      }
      console.log(`Successfully generated logo${size}.png`);
    });
  });
}); 