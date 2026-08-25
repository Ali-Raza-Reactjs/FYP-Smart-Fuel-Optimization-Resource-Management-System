const fs = require('fs');
const path = require('path');

function walkSync(dir, filelist = []) {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    if (fs.statSync(dirFile).isDirectory()) {
      filelist = walkSync(dirFile, filelist);
    } else {
      if (dirFile.endsWith('.jsx')) {
        filelist.push(dirFile);
      }
    }
  });
  return filelist;
}

const files = walkSync('d:/Ali Raza/FYP/frontend/src/pages');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // We want to replace `error.response?.data?.message || 'Fallback'` with `error.message || error.response?.data?.message || 'Fallback'`
  // Let's use regex to find `error.response?.data?.message` or similar
  
  // Actually, since we've thrown a standard Error from services: throw new Error(...)
  // We can just safely prepend `error.message || ` in front of `error.response?.data?.message ||`
  
  content = content.replace(/error\.response\?\.data\?\.message/g, 'error.message || error.response?.data?.message');
  
  // wait, did I do that for AuthContext earlier? Yes I did.
  
  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', path.basename(file));
  }
});
