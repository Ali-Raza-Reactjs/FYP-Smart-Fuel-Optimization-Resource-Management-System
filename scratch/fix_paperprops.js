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

const files = walkSync('d:/Ali Raza/FYP/frontend/src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace inputProps
  // It looks like inputProps={{ step: "0.01" }} or inputProps={{ style: { textTransform: 'uppercase' } }}
  // We can manually find the start index of 'inputProps={{', then find the matching closing '}}'
  let idx = content.indexOf('inputProps={{');
  while (idx !== -1) {
    let braceCount = 2;
    let endIdx = idx + 13; // length of 'inputProps={{'
    while (braceCount > 0 && endIdx < content.length) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    // Now from idx to endIdx is the whole string
    const match = content.substring(idx, endIdx);
    const inner = match.substring(13, match.length - 2);
    
    const replacement = `slotProps={{ htmlInput: {${inner}} }}`;
    content = content.substring(0, idx) + replacement + content.substring(endIdx);
    
    // find next
    idx = content.indexOf('inputProps={{', idx + replacement.length);
  }

  // Replace PaperProps
  idx = content.indexOf('PaperProps={{');
  while (idx !== -1) {
    let braceCount = 2;
    let endIdx = idx + 13;
    while (braceCount > 0 && endIdx < content.length) {
      if (content[endIdx] === '{') braceCount++;
      if (content[endIdx] === '}') braceCount--;
      endIdx++;
    }
    
    const match = content.substring(idx, endIdx);
    const inner = match.substring(13, match.length - 2);
    
    const replacement = `slotProps={{ paper: {${inner}} }}`;
    content = content.substring(0, idx) + replacement + content.substring(endIdx);
    
    idx = content.indexOf('PaperProps={{', idx + replacement.length);
  }

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    console.log('Fixed:', path.basename(file));
  }
});
