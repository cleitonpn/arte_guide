import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `base` precisa bater com o nome do repositório para o GitHub Pages
// servir os assets a partir de https://<usuario>.github.io/arte_guide/
export default defineConfig({
  plugins: [react()],
  base: '/arte_guide/',
});
