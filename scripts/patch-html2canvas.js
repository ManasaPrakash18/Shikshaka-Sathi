const fs = require('fs');
const path = require('path');

const filesToPatch = [
  'node_modules/html2canvas/dist/html2canvas.js',
  'node_modules/html2canvas/dist/html2canvas.esm.js',
  'node_modules/html2canvas/dist/lib/css/types/color.js'
];

filesToPatch.forEach(fileRel => {
  const filePath = path.join(process.cwd(), fileRel);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // 1. Replace throw or previous fallback with transparent (0) for unsupported color functions
    const errRegex = /throw new Error\([\"']Attempting to parse an unsupported color function [^)]+\);/g;
    if (errRegex.test(content)) {
      content = content.replace(errRegex, 'return 0;');
      changed = true;
    }

    const fallbackRegex = /(SUPPORTED_COLOR_FUNCTIONS\[value\.name\];\s*if\s*\(typeof colorFunction === ['"]undefined['"]\)\s*\{\s*)return \d+;/g;
    if (fallbackRegex.test(content)) {
      content = content.replace(fallbackRegex, '$1return 0;');
      changed = true;
    }

    // 2. Disable letter-spacing splitting in html2canvas (always return 0 so complex Indic/Kannada ligatures don't shatter)
    const letterSpacingRegex = /(name:\s*['"]letter-spacing['"],\s*initialValue:\s*['"]0['"],\s*prefix:\s*false,\s*type:\s*0[^\n]*,\s*parse:\s*function\s*\([^)]*\)\s*\{)/g;
    if (letterSpacingRegex.test(content)) {
      content = content.replace(letterSpacingRegex, '$1 return 0;');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully patched:', fileRel);
    }
  }
});
