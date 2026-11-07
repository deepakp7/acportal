// Internal application version, build reference and commit changelog
// Note: Internal details are kept private; no public GitHub links are exposed to end users.

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.2.0';
export const COMMIT_HASH = typeof __COMMIT_HASH__ !== 'undefined' ? __COMMIT_HASH__ : '4247e4e';
export const BUILD_DATE = typeof __BUILD_DATE__ !== 'undefined' ? __BUILD_DATE__ : '7 Nov 2026';

export const CHANGELOG = typeof __CHANGELOG__ !== 'undefined' ? __CHANGELOG__ : [
    { hash: "4247e4e", date: "2026-11-07", subject: "Help & About modal with versioning and internal commit changelog" },
    { hash: "bf37d6a", date: "2026-11-07", subject: "Athlete Analytics tab and Comprehensive Po10 Scraper engine" },
    { hash: "a86a3a2", date: "2026-11-07", subject: "Add missing junior athletes to EA PB certificates dataset and enhance discipline awards" },
    { hash: "b304380", date: "2026-11-01", subject: "Meet Manager Document Archive & OneDrive integration, and separate per-meet independent checklists" },
    { hash: "32bf625", date: "2026-10-31", subject: "Meet Manager tile with autonomous agents, checklists, timetables, contacts & enhance HACY AI" },
    { hash: "c3eabe7", date: "2026-10-31", subject: "Add England Athletics Age Group Changes & UKA 2026 Rules for Competition to HACY RAG" },
    { hash: "3e8aaa5", date: "2026-10-28", subject: "Add HACY AI Chatbot with RAG, Live Weather, Admin Supervision, and Free SLM support" }
];
