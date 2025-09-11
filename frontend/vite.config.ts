import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { componentTagger } from "lovable-tagger";
import babel from 'vite-plugin-babel';
// @ts-expect-error - No types available for this babel plugin
import functionFrames from '@ton-ai-core/devtrace/babel-plugin';

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  esbuild: {
    jsx: 'automatic',
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    mode === 'development' && babel({
      filter: (id: string) => {
        if (!/[.][tj]sx?$/.test(id)) return false;
        if (id.includes('/node_modules/')) return false;
        if (!id.includes('/src/')) return false;
        if (id.includes('/src/devtools/')) return false;
        if (id.includes('/src/trace-context')) return false;
        if (id.endsWith('/src/index.tsx')) return false;
        if (id.endsWith('/src/main.tsx')) return false;
        return true;
      },
      babelConfig: {
        presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
        plugins: [functionFrames]
      }
    })
  ].filter(Boolean),
}))
