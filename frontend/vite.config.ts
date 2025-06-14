import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  base: "/static/",   
  plugins: [react()],
  build: {
    outDir: "dist",
  },
});