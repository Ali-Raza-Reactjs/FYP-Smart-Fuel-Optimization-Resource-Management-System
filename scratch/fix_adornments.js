const fs = require('fs');
const path = require('path');

const dir = 'd:/Ali Raza/FYP/frontend/src/components';
const filesToFix = [
  'ui/TextField.jsx',
  'ui/Select.jsx',
  'ui/DataTable.jsx',
  'map/LocationSearch.jsx'
];

filesToFix.forEach(file => {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(/\) : \{\}/g, ') : null');
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('Fixed:', file);
  }
});
