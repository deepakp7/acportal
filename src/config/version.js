// Build-time injected constants from Vite with fallbacks
export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.2.0';
export const COMMIT_HASH = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : 'bf37d6a';
export const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '7 Nov 2026';
export const GITHUB_REPO = 'https://github.com/deepakp7/acportal';
export const COMMIT_URL = `${GITHUB_REPO}/commit/${COMMIT_HASH}`;
