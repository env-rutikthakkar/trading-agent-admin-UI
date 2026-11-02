import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The portal talks to the same backend gateway as the user app, under
// /api/platform. In dev, /api is proxied to it so the browser stays on one
// origin and no CORS setup is needed.
export default defineConfig({
    plugins: [react()],
    server: {
        host: true,
        port: 5174,
        proxy: {
            '/api': {
                target: process.env.API_TARGET || 'http://localhost:3000',
                changeOrigin: true,
            }
        }
    }
})
