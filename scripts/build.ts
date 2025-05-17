import { spawnSync } from 'child_process';
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

// Ensure dist directory exists
if (!existsSync('dist')) {
	mkdirSync('dist');
}

// Run TypeScript compiler
console.log('Running TypeScript compiler...');
const tscResult = spawnSync('tsc', [], { stdio: 'inherit', shell: true });
if (tscResult.status !== 0) {
	console.error('TypeScript compilation failed');
	process.exit(1);
}

// Create package.json for the dist directory
console.log('Creating package.json for dist...');
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const distPkg = {
	name: pkg.name,
	version: pkg.version,
	description: pkg.description,
	main: './index.js',
	types: './index.d.ts',
	type: 'module',
	exports: {
		'.': {
			require: './index.js',
			types: './index.d.ts'
		}
	},
	author: pkg.author,
	license: pkg.license,
	repository: pkg.repository,
	keywords: pkg.keywords,
	peerDependencies: pkg.peerDependencies,
	dependencies: pkg.dependencies || {}
};

writeFileSync('dist/package.json', JSON.stringify(distPkg, null, 2));

// Copy README.md if it exists
if (existsSync('README.md')) {
	copyFileSync('README.md', 'dist/README.md');
}

console.log('Build completed successfully! ✨');
