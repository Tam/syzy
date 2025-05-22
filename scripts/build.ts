import { spawnSync } from 'child_process';
import { existsSync, mkdirSync, rmSync, copyFileSync } from 'fs';

// Ensure dist directory exists
if (existsSync('dist')) rmSync('dist', { force: true, recursive: true });
mkdirSync('dist');

// Run TypeScript compiler
console.log('Running TypeScript compiler...');
const tscResult = spawnSync('tsc', [], { stdio: 'inherit', shell: true });
if (tscResult.status !== 0) {
	console.error('TypeScript compilation failed');
	process.exit(1);
}

// Copy types.d.ts
console.log('Copying files...');
copyFileSync('src/types.d.ts', 'dist/types.d.ts');

console.log('Build completed successfully! ✨');
