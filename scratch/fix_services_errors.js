const fs = require('fs');
const path = require('path');

const servicesDir = 'd:/Ali Raza/FYP/frontend/src/services';

const files = fs.readdirSync(servicesDir);

files.forEach(file => {
  if (file.endsWith('.js') && file !== 'api.js' && file !== 'auth.service.js') {
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace: const { response } = await fetchMethod(...) 
    // Wait, fetchMethod might be multi-line:
    // const { response } = await fetchMethod(() => api.post(API_URL, data));
    // Let's use a regex that looks for `fetchMethod` calls and appends the check after the semicolon.

    // Better regex:
    // Match `fetchMethod( ... );`
    const regex = /(const\s+\{\s*response\s*\}\s*=\s*await\s+fetchMethod\([^;]+;\s*)/g;
    
    // Make sure we don't duplicate if already added
    if (!content.includes('throw new Error(response?.msg')) {
      content = content.replace(regex, `$1if (!response?.status) throw new Error(response?.msg || response?.message || 'Request failed');\n  `);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${file}`);
    }
  }
});
