import { defineConfig } from 'vite';
import dotenv from 'dotenv';

dotenv.config(); // Load .env variables

export default defineConfig({
    define: {
        'process.env': process.env, // Inject environment variables into the browser
    },
});