import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { babel as viteBabel } from '@rollup/plugin-babel'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {

  return {
    plugins: [
      react(),
      // Add devtrace Babel plugin in development mode
      mode === 'development' && viteBabel({
        filter: (id: unknown) => {
          if (typeof id !== 'string') return false;
          if (!/[.][tj]sx?$/.test(id)) return false;
          if (id.includes('/node_modules/')) return false;
          if (!id.includes('/src/')) return false;
          if (id.includes('/src/devtools/')) return false;
          if (id.includes('/src/trace-context')) return false;
          if (id.endsWith('/src/index.tsx')) return false;
          if (id.endsWith('/src/main.tsx')) return false;
          if (id.endsWith('/src/mockEnv.ts')) return false;
          return true;
        },
        babelHelpers: 'bundled',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
        presets: [["@babel/preset-typescript", { isTSX: true, allExtensions: true }]],
      })
    ].filter(Boolean),
  }
})
