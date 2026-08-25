const fs = require('fs');
const path = require('path');

const dir = 'd:/Ali Raza/FYP/backend/src/controllers';
const files = fs.readdirSync(dir);

files.forEach(file => {
  if (file.endsWith('.js')) {
    const fullPath = path.join(dir, file);
    let content = fs.readFileSync(fullPath, 'utf-8');
    if (content.includes('new: true')) {
      content = content.replace(/new:\s*true/g, "returnDocument: 'after'");
      fs.writeFileSync(fullPath, content, 'utf-8');
      console.log('Fixed:', file);
    }
  }
});
