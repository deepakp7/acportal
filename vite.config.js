import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { execSync } from 'child_process'
import fs from 'fs'

const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf-8'))

let commitHash = '4247e4e'
let changelog = []
try {
    commitHash = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.COMMIT_REF || '').slice(0, 7) ||
        execSync('git rev-parse --short HEAD').toString().trim()
} catch (e) {
    commitHash = '4247e4e'
}

try {
    const raw = execSync('git log --pretty=format:\'{"hash":"%h","date":"%ad","subject":"%s"}\' --date=short -n 12').toString()
    changelog = raw.trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
} catch (e) {
    changelog = [
        { hash: commitHash, date: "2026-11-07", subject: "Add dynamic application version, Help/About modal and internal release changelog" },
        { hash: "bf37d6a", date: "2026-11-07", subject: "Implement Athlete Analytics tab and Comprehensive Po10 Scraper engine" },
        { hash: "a86a3a2", date: "2026-11-07", subject: "Add missing junior athletes to EA PB certificates dataset and enhance discipline awards" },
        { hash: "b304380", date: "2026-11-01", subject: "Add Meet Manager Document Archive & OneDrive integration, and separate per-meet independent checklists" },
        { hash: "32bf625", date: "2026-10-31", subject: "Add Meet Manager tile with autonomous agents, checklists, timetables, contacts & enhance HACY AI" },
        { hash: "c3eabe7", date: "2026-10-31", subject: "Add England Athletics Age Group Changes & UKA 2026 Rules for Competition to HACY RAG" },
        { hash: "3e8aaa5", date: "2026-10-28", subject: "Add HACY AI Chatbot with RAG, Live Weather, Admin Supervision, and Free SLM support" }
    ]
}

const buildDate = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })

// https://vitejs.dev/config/
export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version || '1.2.0'),
        __COMMIT_HASH__: JSON.stringify(commitHash),
        __BUILD_DATE__: JSON.stringify(buildDate),
        __CHANGELOG__: JSON.stringify(changelog)
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
