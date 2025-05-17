import { watch } from 'fs';
import { spawn } from 'child_process';

// Directories to watch
const dirs = ['test-bed', 'src'];
// File extensions to watch
const extensions = ['.twig', '.css', '.js', '.ts'];

let process = startApp();

// Watch each directory
dirs.forEach(dir => {
	watch(dir, { recursive: true }, (_, filename) => {
		if (!filename) return;

		// Check if the changed file has one of the extensions we're watching
		if (extensions.some(ext => filename.endsWith(ext))) {
			console.log(`File changed: ${filename}`);

			// Restart the app
			if (process) process.kill();
			process = startApp();
		}
	});
});

function startApp () {
	console.log('Starting application...');
	return spawn('bun', ['run', 'test-bed/server.ts'], { stdio: 'inherit' });
}
