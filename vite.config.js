import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'], // Ubah ekstensi dari .js ke .tsx
            refresh: true,
        }),
        react(), // Tambahkan plugin react di sini
    ],
});