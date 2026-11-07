import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

let commitHash = 'bf37d6a'
try {
    commitHash = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || '').slice(0, 7) ||
        execSync('git rev-parse --short HEAD').toString().trim()
} catch (e) {
    commitHash = 'bf37d6a'
}

const buildDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version || '1.2.0'),
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __BUILD_DATE__: JSON.stringify(buildDate)
    },
    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Hillingdon AC Membership',
                short_name: 'HAC Portal',
                description: 'Hillingdon AC Membership Portal and Management System',
                theme_color: '#0f172a',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
})
