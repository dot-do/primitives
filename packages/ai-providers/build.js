import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Clean dist directory
console.log('Cleaning dist directory...');
execSync('rimraf dist');

// Build main files with esbuild
console.log('Building main files with esbuild...');
execSync('esbuild index.ts --bundle --platform=node --outfile=dist/index.js --format=cjs --external:*');
execSync('esbuild index.ts --bundle --platform=node --outfile=dist/index.mjs --format=esm --external:*');

// Generate type declarations
console.log('Generating type declarations...');
execSync('tsc --declaration --emitDeclarationOnly');

// Create src directory in dist
console.log('Creating src directory in dist...');
fs.mkdirSync('dist/src', { recursive: true });

// Compile registry.ts to registry.js
console.log('Compiling registry.ts to registry.js...');
execSync('esbuild src/registry.ts --bundle --platform=node --outfile=dist/src/registry.js --format=esm --external:*');

// Compile provider.ts to provider.js (for both old and new index.js compatibility)
console.log('Compiling provider.ts to provider.js...');
execSync('esbuild src/provider.ts --bundle --platform=node --outfile=dist/src/provider.js --format=cjs --external:*');
execSync('esbuild src/provider.ts --bundle --platform=node --outfile=dist/provider.js --format=cjs --external:*');

console.log('Build completed successfully!');
