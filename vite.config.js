// vite.config.js
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default ({ mode }) => {
  // load .env, .env.development, .env.production, dsb
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [
      vue({
        template: {
          compilerOptions: {
            // treat ionic web components (ion-*) as native custom elements
            isCustomElement: tag => tag.startsWith('ion-')
          }
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    },
    base: env.VITE_BASE_URL || '/',
    server: {
      port: 8100, // cocok untuk ionic serve style; ubah jika perlu
      open: false,
      // proxy hanya untuk development agar tidak perlu set CORS di backend
      proxy: {
        // contoh: proxy semua /api/* ke backend
        '/posts': {
          target: env.VITE_API_BASE || 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false
        },
        '/auth': {
          target: env.VITE_API_BASE || 'http://127.0.0.1:3000',
          changeOrigin: true,
          secure: false
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      rollupOptions: {
        output: {
          // kontrol chunking jika perlu
        }
      }
    },
    define: {
      // jika perlu override global constants
      'process.env': {}
    }
  })
}
