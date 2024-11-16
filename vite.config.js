import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

export default defineConfig({
    root: 'timetable',  // Specify the folder where your index.html is located
    build: {
        outDir: '../dist',  // Output build to a separate 'dist' directory
    },
    define: {
        'process.env': process.env, // Inject environment variables into the browser
    },
});