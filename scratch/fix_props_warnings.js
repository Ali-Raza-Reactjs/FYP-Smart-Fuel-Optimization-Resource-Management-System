const fs = require('fs');
const path = require('path');

const dir = 'd:/Ali Raza/FYP/frontend/src';

function replaceInFile(filePath, find, replace) {
  const fullPath = path.join(dir, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content.replace(find, replace);
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('Fixed:', filePath);
  }
}

// Fix lineHeight in Header.jsx
replaceInFile(
  'components/layout/Header.jsx',
  'lineHeight={1.2}',
  'sx={{ lineHeight: 1.2 }}'
);

// Fix InputProps in TextField.jsx
replaceInFile(
  'components/ui/TextField.jsx',
  /InputProps=\{\{([\s\S]*?)\}\}/,
  'slotProps={{ input: {$1} }}'
);

// Fix InputProps in Select.jsx
replaceInFile(
  'components/ui/Select.jsx',
  /InputProps=\{\{([\s\S]*?)\}\}/,
  'slotProps={{ input: {$1} }}'
);

// Fix InputProps in DataTable.jsx
replaceInFile(
  'components/ui/DataTable.jsx',
  /InputProps=\{\{([\s\S]*?)\}\}/,
  'slotProps={{ input: {$1} }}'
);

// Fix InputProps in LocationSearch.jsx
replaceInFile(
  'components/map/LocationSearch.jsx',
  /InputProps=\{\{([\s\S]*?)\}\}/,
  'slotProps={{ input: {$1} }}'
);

// Fix primaryTypographyProps in LocationSearch.jsx
replaceInFile(
  'components/map/LocationSearch.jsx',
  "primaryTypographyProps={{ variant: 'body2', noWrap: false }}",
  "slotProps={{ primary: { variant: 'body2', noWrap: false } }}"
);

// Fix primaryTypographyProps in Sidebar.jsx
replaceInFile(
  'components/layout/Sidebar.jsx',
  /primaryTypographyProps=\{\{([\s\S]*?)\}\}/,
  'slotProps={{ primary: { sx: {$1} } }}'
);

