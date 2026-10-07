const fs = require('fs');

// Decode and save image
function saveBase64(filename, base64Data) {
  const clean = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(clean, 'base64');
  fs.writeFileSync(filename, buffer);
  console.log(`Saved ${filename} (${buffer.length} bytes)`);
}

module.exports = { saveBase64 };
