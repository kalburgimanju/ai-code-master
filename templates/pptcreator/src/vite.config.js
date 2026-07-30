import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        open: true,
    },
    build: {
        outDir: 'dist',
        sourcemap: true,
        rollupOptions: {
            output: {
                manualChunks: {
                    react: ['react', 'react-dom'],
                    ui: ['./src/components/ui/Button.tsx', './src/components/ui/Input.tsx'],
                    pdf: ['pdfjs-dist', 'file-saver', 'docx', 'html-to-image'],
                },
            },
        },
    },
    resolve: {
        alias: {
            '@': '/src',
            '@components': '/src/components',
            '@ui': '/src/components/ui',
        },
    },
    css: {
        postcss: './postcss.config.js',
    },
});
