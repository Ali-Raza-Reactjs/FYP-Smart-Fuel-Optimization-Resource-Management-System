const fs = require('fs');
const path = require('path');

const dir = 'd:/Ali Raza/FYP/frontend/src/pages';
const filesToFix = ['Dashboard.jsx', 'Admin/UserManagement.jsx'];

filesToFix.forEach(file => {
  const fullPath = path.join(dir, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf-8');
    // Replace textTransform="uppercase" with sx={{ textTransform: 'uppercase' }} in Typography
    // Be careful not to overwrite existing sx props, though typically there aren't any on these specific lines
    
    content = content.replace(/<Typography([^>]*)textTransform="uppercase"([^>]*)>/g, (match, p1, p2) => {
        // If it already has an sx prop, we should merge. But let's check if it does
        if (match.includes('sx={{')) {
            return match.replace(/textTransform="uppercase"/, '').replace(/sx=\{\{/, "sx={{ textTransform: 'uppercase', ");
        } else {
            return `<Typography${p1}${p2} sx={{ textTransform: 'uppercase' }}>`;
        }
    });

    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log('Fixed:', file);
  }
});
