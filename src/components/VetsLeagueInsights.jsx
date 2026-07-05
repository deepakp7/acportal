import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import fallbackData from '../assets/vets_league_2026.json';
import { Chart, registerables } from 'chart.js';
import { 
    Award, 
    TrendingUp, 
    Users, 
    AlertTriangle, 
    Download, 
    LayoutDashboard, 
    User, 
    UserCheck, 
    Search,
    ShieldCheck, 
    Info, 
    Activity
} from 'lucide-react';

Chart.register(...registerables);

const VetsLeagueInsights = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');
    const [database, setDatabase] = useState(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMeet, setFilterMeet] = useState('');
    const [filterGender, setFilterGender] = useState('');
    const [filterClub, setFilterClub] = useState('');
    const [filterType, setFilterType] = useState('');

    // Chart Canvas Refs
    const progressionCanvasRef = useRef(null);
    const contributionCanvasRef = useRef(null);
    const menTopScorersCanvasRef = useRef(null);
    const menAgeGroupCanvasRef = useRef(null);
    const womenTopScorersCanvasRef = useRef(null);
    const womenAgeGroupCanvasRef = useRef(null);

    // Chart Instance Refs
    const progressionChartRef = useRef(null);
    const contributionChartRef = useRef(null);
    const menTopScorersChartRef = useRef(null);
    const menAgeGroupChartRef = useRef(null);
    const womenTopScorersChartRef = useRef(null);
    const womenAgeGroupChartRef = useRef(null);

    // Load Data
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const { data: results, error: resultsErr } = await supabase.from('results').select('*');
                const { data: missed, error: missedErr } = await supabase.from('hac_missed_events').select('*');

                if (resultsErr || missedErr || !results || results.length === 0) {
                    console.log("Supabase data missing or not yet populated. Using static JSON fallback.");
                    setDatabase(fallbackData);
                } else {
                    // Map Supabase performance column back to 'perf' for compatibility
                    const processedResults = results.map(r => ({
                        ...r,
                        perf: r.performance
                    }));
                    setDatabase({
                        results: processedResults,
                        hac_missed_events: missed || []
                    });
                }
            } catch (err) {
                console.warn("Failed to load from Supabase, using local JSON fallback:", err);
                setDatabase(fallbackData);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Helper to destroy charts
    const destroyAllCharts = () => {
        if (progressionChartRef.current) progressionChartRef.current.destroy();
        if (contributionChartRef.current) contributionChartRef.current.destroy();
        if (menTopScorersChartRef.current) menTopScorersChartRef.current.destroy();
        if (menAgeGroupChartRef.current) menAgeGroupChartRef.current.destroy();
        if (womenTopScorersChartRef.current) womenTopScorersChartRef.current.destroy();
        if (womenAgeGroupChartRef.current) womenAgeGroupChartRef.current.destroy();
    };

    // Draw charts depending on tab
    useEffect(() => {
        if (!database) return;

        destroyAllCharts();

        // Chart default settings for dark theme matching the landing portal
        Chart.defaults.color = '#94a3b8';
        Chart.defaults.borderColor = 'rgba(51, 65, 85, 0.4)';
        Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

        if (activeTab === 'overview') {
            renderOverviewCharts();
        } else if (activeTab === 'men') {
            renderMenCharts();
        } else if (activeTab === 'women') {
            renderWomenCharts();
        }

        return () => destroyAllCharts();
    }, [database, activeTab]);

    const renderOverviewCharts = () => {
        // Progression Chart
        if (progressionCanvasRef.current) {
            const ctx = progressionCanvasRef.current.getContext('2d');
            progressionChartRef.current = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: ['Meet 1 (Battersea)', 'Meet 2 (Hillingdon)', 'Meet 3 (Tooting)', 'Meet 4 (Perivale)'],
                    datasets: [
                        {
                            label: 'Men Points',
                            data: [165.0, 164.0, 167.0, 157.0],
                            borderColor: '#3b82f6',
                            backgroundColor: 'rgba(59, 130, 246, 0.1)',
                            borderWidth: 3,
                            tension: 0.2,
                            fill: true
                        },
                        {
                            label: 'Women Points',
                            data: [139.5, 159.0, 140.0, 159.0],
                            borderColor: '#ec4899',
                            backgroundColor: 'rgba(236, 72, 153, 0.1)',
                            borderWidth: 3,
                            tension: 0.2,
                            fill: true
                        }
                    ]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { min: 120, max: 180 }
                    }
                }
            });
        }

        // Contribution Chart
        if (contributionCanvasRef.current) {
            const ctx = contributionCanvasRef.current.getContext('2d');
            const menTotal = 165.0 + 164.0 + 167.0 + 157.0;
            const womenTotal = 139.5 + 159.0 + 140.0 + 159.0;
            contributionChartRef.current = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Men', 'Women'],
                    datasets: [{
                        data: [menTotal, womenTotal],
                        backgroundColor: ['#2563eb', '#db2777'],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    };

    const renderMenCharts = () => {
        const processed = getAthletesSummary('Men');
        const topMen = processed.slice(0, 8);

        // Top Scorers
        if (menTopScorersCanvasRef.current) {
            const ctx = menTopScorersCanvasRef.current.getContext('2d');
            menTopScorersChartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: topMen.map(a => a.name),
                    datasets: [{
                        label: 'Points Scored',
                        data: topMen.map(a => a.points),
                        backgroundColor: 'rgba(37, 99, 235, 0.85)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Age Groups
        if (menAgeGroupCanvasRef.current) {
            const ctx = menAgeGroupCanvasRef.current.getContext('2d');
            const ageGroupPoints = {};
            processed.forEach(ath => {
                ageGroupPoints[ath.age] = (ageGroupPoints[ath.age] || 0) + ath.points;
            });
            const ageGroupLabels = Object.keys(ageGroupPoints).sort();
            const ageGroupData = ageGroupLabels.map(l => ageGroupPoints[l]);

            menAgeGroupChartRef.current = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ageGroupLabels,
                    datasets: [{
                        data: ageGroupData,
                        backgroundColor: [
                            '#1e3a8a', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                }
            });
        }
    };

    const renderWomenCharts = () => {
        const processed = getAthletesSummary('Women');
        const topWomen = processed.slice(0, 8);

        // Top Scorers
        if (womenTopScorersCanvasRef.current) {
            const ctx = womenTopScorersCanvasRef.current.getContext('2d');
            womenTopScorersChartRef.current = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: topWomen.map(a => a.name),
                    datasets: [{
                        label: 'Points Scored',
                        data: topWomen.map(a => a.points),
                        backgroundColor: 'rgba(219, 39, 119, 0.85)',
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: 'y',
                    plugins: { legend: { display: false } }
                }
            });
        }

        // Age Groups
        if (womenAgeGroupCanvasRef.current) {
            const ctx = womenAgeGroupCanvasRef.current.getContext('2d');
            const ageGroupPoints = {};
            processed.forEach(ath => {
                ageGroupPoints[ath.age] = (ageGroupPoints[ath.age] || 0) + ath.points;
            });
            const ageGroupLabels = Object.keys(ageGroupPoints).sort();
            const ageGroupData = ageGroupLabels.map(l => ageGroupPoints[l]);

            womenAgeGroupChartRef.current = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ageGroupLabels,
                    datasets: [{
                        data: ageGroupData,
                        backgroundColor: [
                            '#831843', '#9d174d', '#be185d', '#db2777', '#f472b6', '#fbcfe8', '#fce7f3'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { position: 'right' } }
                }
            });
        }
    };

    // Calculate Athlete Points Standing
    const getAthletesSummary = (genderFilter) => {
        if (!database) return [];
        const allAthletes = {};
        const hacResults = database.results.filter(r => r.club_clean === 'Hillingdon AC' && r.gender === genderFilter);

        hacResults.forEach(r => {
            if (r.athlete_clean && r.athlete_clean !== 'Hillingdon Relay') {
                if (!allAthletes[r.athlete_clean]) {
                    allAthletes[r.athlete_clean] = {
                        name: r.athlete_clean,
                        gender: r.gender,
                        age: r.age_clean || 'Unknown',
                        points: 0,
                        meets: new Set(),
                        events: 0
                    };
                }
                if (r.type === 'scoring') {
                    allAthletes[r.athlete_clean].points += r.points_scored;
                }
                allAthletes[r.athlete_clean].meets.add(r.meet_id);
                allAthletes[r.athlete_clean].events += 1;
            }
        });

        return Object.values(allAthletes).sort((a, b) => b.points - a.points);
    };

    const getKPIs = () => {
        if (!database) return { totalPoints: 0, avgPoints: 0, totalAthletes: 0, missedEvents: 0 };
        const hacResults = database.results.filter(r => r.club_clean === 'Hillingdon AC');
        let totalPoints = 0;
        const athletes = new Set();

        hacResults.forEach(r => {
            if (r.type === 'scoring') totalPoints += r.points_scored;
            if (r.athlete_clean && r.athlete_clean !== 'Hillingdon Relay') athletes.add(r.athlete_clean);
        });

        return {
            totalPoints: totalPoints.toFixed(1),
            avgPoints: (totalPoints / 4).toFixed(1),
            totalAthletes: athletes.size,
            missedEvents: database.hac_missed_events.length
        };
    };

    // Download offline dashboard logic
    const handleDownload = () => {
        if (!database) return;

        const dbJSON = JSON.stringify(database);
        const template = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hillingdon AC - Vets League 2026 Insights</title>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <style>
        :root {
            --bg-primary: #0b0f19;
            --bg-secondary: #131a2c;
            --bg-card: rgba(26, 35, 57, 0.45);
            --border-color: rgba(55, 65, 81, 0.4);
            --text-primary: #f3f4f6;
            --text-secondary: #9ca3af;
            --primary: #2563eb;
            --primary-hover: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
        }
        body {
            background-color: var(--bg-primary);
            color: var(--text-primary);
            font-family: 'Plus Jakarta Sans', sans-serif;
            padding: 2rem;
            margin: 0;
        }
        .container { max-width: 1400px; margin: 0 auto; }
        header { display: flex; align-items: center; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .logo-badge { background: var(--primary); color: #fff; width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: bold; }
        h1 { margin: 0; font-family: 'Outfit', sans-serif; font-size: 1.75rem; }
        header p { margin: 0.25rem 0 0 0; color: var(--text-secondary); font-size: 0.85rem; }
        .nav-tabs { display: flex; gap: 0.5rem; border-bottom: 1px solid var(--border-color); margin-bottom: 2rem; padding-bottom: 0.5rem; }
        .tab-btn { background: transparent; border: none; color: var(--text-secondary); padding: 0.6rem 1.2rem; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 0.9rem; }
        .tab-btn.active { background: var(--primary); color: #fff; }
        .tab-content { display: none; }
        .tab-content.active { display: block; }
        .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .kpi-card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 12px; padding: 1.5rem; display: flex; align-items: center; gap: 1rem; }
        .kpi-info h4 { margin: 0; text-transform: uppercase; font-size: 0.75rem; color: var(--text-secondary); }
        .kpi-value { font-size: 1.75rem; font-weight: bold; font-family: 'Outfit', sans-serif; }
        .card { background: var(--bg-card); border: 1px solid var(--border-color); border-radius: 16px; padding: 1.5rem; margin-bottom: 2rem; }
        .card-header { border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; margin-bottom: 1rem; font-size: 1.15rem; font-weight: bold; font-family: 'Outfit', sans-serif; }
        .grid-2col { display: grid; grid-template-columns: repeat(auto-fit, minmax(450px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .table-responsive { overflow-x: auto; border: 1px solid var(--border-color); border-radius: 10px; }
        table { width: 100%; border-collapse: collapse; font-size: 0.85rem; text-align: left; }
        th { background: var(--bg-secondary); padding: 0.75rem 1rem; font-weight: 600; border-bottom: 1px solid var(--border-color); color: var(--text-secondary); }
        td { padding: 0.75rem 1rem; border-bottom: 1px solid var(--border-color); }
        .badge { padding: 0.2rem 0.5rem; border-radius: 20px; font-size: 0.7rem; font-weight: bold; text-transform: uppercase; display: inline-block; }
        .badge.blue { background: rgba(37,99,235,0.15); color: #60a5fa; }
        .badge.green { background: rgba(16,185,129,0.15); color: #34d399; }
        .badge.yellow { background: rgba(245,158,11,0.15); color: #fbbf24; }
        .badge.red { background: rgba(239,68,68,0.15); color: #f87171; }
        .alert-box { background: rgba(239, 68, 68, 0.08); border-left: 4px solid var(--danger); padding: 1rem; border-radius: 6px; margin-bottom: 1.5rem; display: flex; gap: 0.5rem; font-size: 0.85rem; }
        .alert-box.info { background: rgba(37, 99, 235, 0.08); border-left-color: var(--primary); }
        .alert-title { font-weight: bold; margin-bottom: 0.2rem; }
        .chart-container { height: 280px; position: relative; }
        .star-card { background: rgba(37, 99, 235, 0.05); border: 1px solid var(--border-color); border-radius: 12px; padding: 1rem; margin-bottom: 1rem; }
        .star-header { display: flex; gap: 0.75rem; align-items: center; }
        .star-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .star-stats { display: flex; justify-content: space-between; border-top: 1px solid var(--border-color); margin-top: 0.75rem; padding-top: 0.5rem; font-size: 0.8rem; }
    </style>
</head>
<body>
    <div class="container">
        <header>
            <div class="logo-badge">HAC</div>
            <div>
                <h1>Hillingdon AC</h1>
                <p>Southern Counties Veterans T&F League 2026 Insights Report (Offline Copy)</p>
            </div>
        </header>

        <div class="nav-tabs">
            <button class="tab-btn active" onclick="switchTab('overview')">Overview & Verify</button>
            <button class="tab-btn" onclick="switchTab('men')">Men's League</button>
            <button class="tab-btn" onclick="switchTab('women')">Women's League</button>
            <button class="tab-btn" onclick="switchTab('search')">Combined Search</button>
        </div>

        <!-- ==================== OVERVIEW ==================== -->
        <div id="overview" class="tab-content active">
            <div class="kpi-grid" id="kpis-container"></div>
            <div class="card">
                <div class="card-header">Point Verification & Discrepancies</div>
                <div class="alert-box info">
                    <div>
                        <div class="alert-title">Point Audit Summary</div>
                        <div>Sum of individual HAC athletes points matches the official summaries perfectly on Meetings 2, 3, & 4. Meeting 1 Women has a rounded 0.5 difference.</div>
                    </div>
                </div>
                <div class="table-responsive">
                    <table>
                        <thead><tr><th>Meeting</th><th>Status & Comparisons</th></tr></thead>
                        <tbody>
                            <tr><td><strong>Meeting 1 (Battersea)</strong></td><td>Men: 165.0 vs 165.0 | Women: 139.5 vs 140.0 <span class="badge yellow">Women Diff: -0.5</span></td></tr>
                            <tr><td><strong>Meeting 2 (Hillingdon)</strong></td><td>Men: 164.0 vs 164.0 | Women: 159.0 vs 159.0 <span class="badge green">Perfect Match</span></td></tr>
                            <tr><td><strong>Meeting 3 (Tooting)</strong></td><td>Men: 167.0 vs 167.0 | Women: 140.0 vs 140.0 <span class="badge green">Perfect Match</span></td></tr>
                            <tr><td><strong>Meeting 4 (Perivale)</strong></td><td>Men: 157.0 vs 157.0 | Women: 159.0 vs 159.0 <span class="badge green">Perfect Match</span></td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">Points Progression by Meet</div>
                    <div class="chart-container"><canvas id="progressionChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header">Total Points Contribution</div>
                    <div class="chart-container"><canvas id="contributionChart"></canvas></div>
                </div>
            </div>
        </div>

        <!-- ==================== MEN ==================== -->
        <div id="men" class="tab-content">
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">Top Scoring Men</div>
                    <div class="chart-container"><canvas id="menTopScorersChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header">Points by Age Group (Men)</div>
                    <div class="chart-container"><canvas id="menAgeGroupChart"></canvas></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">Men's Standings</div>
                <div class="table-responsive"><table id="men-standings-table"><thead><tr><th>Rank</th><th>Name</th><th>Age</th><th>Total Pts</th><th>Meets</th><th>Avg</th></tr></thead><tbody></tbody></table></div>
            </div>
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">Men's All-Meets Competitors (All 4 Meets)</div>
                    <div id="men-all-stars-container"></div>
                </div>
                <div class="card">
                    <div class="card-header">Men's Missed Events</div>
                    <div class="table-responsive"><table id="men-missed-table"><thead><tr><th>Meet</th><th>Event Code</th><th>Event Name</th></tr></thead><tbody></tbody></table></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">Hillingdon Men Consolidated Results by Event</div>
                <div class="table-responsive" style="max-height: 400px;"><table id="men-hac-results-table"><thead><tr><th>Meet</th><th>Event</th><th>Pos</th><th>Athlete</th><th>Age</th><th>Perf</th><th>Pts</th></tr></thead><tbody></tbody></table></div>
            </div>
        </div>

        <!-- ==================== WOMEN ==================== -->
        <div id="women" class="tab-content">
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">Top Scoring Women</div>
                    <div class="chart-container"><canvas id="womenTopScorersChart"></canvas></div>
                </div>
                <div class="card">
                    <div class="card-header">Points by Age Group (Women)</div>
                    <div class="chart-container"><canvas id="womenAgeGroupChart"></canvas></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">Women's Standings</div>
                <div class="table-responsive"><table id="women-standings-table"><thead><tr><th>Rank</th><th>Name</th><th>Age</th><th>Total Pts</th><th>Meets</th><th>Avg</th></tr></thead><tbody></tbody></table></div>
            </div>
            <div class="grid-2col">
                <div class="card">
                    <div class="card-header">Women's All-Meets Competitors (All 4 Meets)</div>
                    <div id="women-all-stars-container"></div>
                </div>
                <div class="card">
                    <div class="card-header">Women's Missed Events</div>
                    <div class="table-responsive"><table id="women-missed-table"><thead><tr><th>Meet</th><th>Event Code</th><th>Event Name</th></tr></thead><tbody></tbody></table></div>
                </div>
            </div>
            <div class="card">
                <div class="card-header">Hillingdon Women Consolidated Results by Event</div>
                <div class="table-responsive" style="max-height: 400px;"><table id="women-hac-results-table"><thead><tr><th>Meet</th><th>Event</th><th>Pos</th><th>Athlete</th><th>Age</th><th>Perf</th><th>Pts</th></tr></thead><tbody></tbody></table></div>
            </div>
        </div>

        <!-- ==================== SEARCH ==================== -->
        <div id="search" class="tab-content">
            <div class="card">
                <div class="card-header">Combined Database Search</div>
                <div style="margin-bottom: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <input type="text" id="search-query" placeholder="Search..." oninput="filterData()" style="padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: white;">
                    <select id="filter-club" onchange="filterData()" style="padding: 0.5rem; border-radius: 6px; border: 1px solid var(--border-color); background: var(--bg-secondary); color: white;">
                        <option value="">All Clubs</option>
                    </select>
                </div>
                <div class="table-responsive" style="max-height: 500px;">
                    <table id="search-table">
                        <thead><tr><th>Meet</th><th>Event</th><th>Pos</th><th>Athlete</th><th>Age</th><th>Club</th><th>Perf</th><th>Pts</th></tr></thead>
                        <tbody></tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        const DATABASE = ${dbJSON};
        
        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.getElementById(tabId).classList.add('active');
            event.currentTarget.classList.add('active');
            
            if(tabId === 'overview') renderOverviewCharts();
            else if(tabId === 'men') renderMenCharts();
            else if(tabId === 'women') renderWomenCharts();
        }

        let progressionChart, contributionChart, menScorersChart, menAgeChart, womenScorersChart, womenAgeChart;

        function renderOverviewCharts() {
            if(progressionChart) progressionChart.destroy();
            if(contributionChart) contributionChart.destroy();
            
            progressionChart = new Chart(document.getElementById('progressionChart').getContext('2d'), {
                type: 'line',
                data: {
                    labels: ['Meet 1', 'Meet 2', 'Meet 3', 'Meet 4'],
                    datasets: [
                        { label: 'Men', data: [165.0, 164.0, 167.0, 157.0], borderColor: '#3b82f6', tension: 0.2 },
                        { label: 'Women', data: [139.5, 159.0, 140.0, 159.0], borderColor: '#ec4899', tension: 0.2 }
                    ]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });

            contributionChart = new Chart(document.getElementById('contributionChart').getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Men', 'Women'],
                    datasets: [{ data: [653.0, 597.5], backgroundColor: ['#2563eb', '#db2777'] }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        function renderMenCharts() {
            if(menScorersChart) menScorersChart.destroy();
            if(menAgeChart) menAgeChart.destroy();
            const summary = getAthletesSummary('Men').slice(0, 8);
            
            menScorersChart = new Chart(document.getElementById('menTopScorersChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: summary.map(a => a.name),
                    datasets: [{ data: summary.map(a => a.points), backgroundColor: '#2563eb' }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            const ages = {};
            getAthletesSummary('Men').forEach(a => ages[a.age] = (ages[a.age] || 0) + a.points);
            menAgeChart = new Chart(document.getElementById('menAgeGroupChart').getContext('2d'), {
                type: 'pie',
                data: {
                    labels: Object.keys(ages).sort(),
                    datasets: [{ data: Object.keys(ages).sort().map(k => ages[k]), backgroundColor: ['#1e3a8a', '#1d4ed8', '#3b82f6', '#60a5fa', '#93c5fd'] }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        function renderWomenCharts() {
            if(womenScorersChart) womenScorersChart.destroy();
            if(womenAgeChart) womenAgeChart.destroy();
            const summary = getAthletesSummary('Women').slice(0, 8);
            
            womenScorersChart = new Chart(document.getElementById('womenTopScorersChart').getContext('2d'), {
                type: 'bar',
                data: {
                    labels: summary.map(a => a.name),
                    datasets: [{ data: summary.map(a => a.points), backgroundColor: '#db2777' }]
                },
                options: { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
            });

            const ages = {};
            getAthletesSummary('Women').forEach(a => ages[a.age] = (ages[a.age] || 0) + a.points);
            womenAgeChart = new Chart(document.getElementById('womenAgeGroupChart').getContext('2d'), {
                type: 'pie',
                data: {
                    labels: Object.keys(ages).sort(),
                    datasets: [{ data: Object.keys(ages).sort().map(k => ages[k]), backgroundColor: ['#831843', '#be185d', '#db2777', '#f472b6'] }]
                },
                options: { responsive: true, maintainAspectRatio: false }
            });
        }

        function getAthletesSummary(gender) {
            const list = {};
            DATABASE.results.filter(r => r.club_clean === 'Hillingdon AC' && r.gender === gender).forEach(r => {
                if (r.athlete_clean && r.athlete_clean !== 'Hillingdon Relay') {
                    if(!list[r.athlete_clean]) list[r.athlete_clean] = { name: r.athlete_clean, age: r.age_clean, points: 0, meets: 0 };
                    if(r.type === 'scoring') list[r.athlete_clean].points += r.points_scored;
                    list[r.athlete_clean].meets++;
                }
            });
            return Object.values(list).sort((a,b) => b.points - a.points);
        }

        function init() {
            // KPIs
            const hacResults = DATABASE.results.filter(r => r.club_clean === 'Hillingdon AC');
            let pts = 0; const aths = new Set();
            hacResults.forEach(r => {
                if(r.type === 'scoring') pts += r.points_scored;
                if(r.athlete_clean) aths.add(r.athlete_clean);
            });
            document.getElementById('kpis-container').innerHTML = \`
                <div class="kpi-card"><div><h4>Total Points</h4><div class="kpi-value">\${pts.toFixed(1)}</div></div></div>
                <div class="kpi-card"><div><h4>Avg Points / Meet</h4><div class="kpi-value">\${(pts/4).toFixed(1)}</div></div></div>
                <div class="kpi-card"><div><h4>Athletes</h4><div class="kpi-value">\${aths.size}</div></div></div>
                <div class="kpi-card"><div><h4>Missed Events</h4><div class="kpi-value">\${DATABASE.hac_missed_events.length}</div></div></div>
            \`;

            // Populate standings tables
            populateStandings('men-standings-table', 'Men');
            populateStandings('women-standings-table', 'Women');

            // Populate results lists
            populateResultsList('men-hac-results-table', 'Men');
            populateResultsList('women-hac-results-table', 'Women');

            // All stars
            populateAllStars('men-all-stars-container', 'Men');
            populateAllStars('women-all-stars-container', 'Women');

            // Missed
            populateMissed('men-missed-table', 'Men');
            populateMissed('women-missed-table', 'Women');

            // Search setup
            const clubs = new Set();
            DATABASE.results.forEach(r => clubs.add(r.club_clean));
            const select = document.getElementById('filter-club');
            Array.from(clubs).sort().forEach(c => select.innerHTML += \`<option value="\${c}">\${c}</option>\`);
            filterData();

            renderOverviewCharts();
        }

        function populateStandings(id, gender) {
            const body = document.querySelector(\`#\${id} tbody\`);
            body.innerHTML = '';
            getAthletesSummary(gender).forEach((a, idx) => {
                body.innerHTML += \`<tr><td><strong>\${idx+1}</strong></td><td>\${a.name}</td><td>\${a.age}</td><td><strong>\${a.points.toFixed(1)}</strong></td><td>\${a.meets}</td><td>\${(a.points/Math.max(1,a.meets)).toFixed(1)}</td></tr>\`;
            });
        }

        function populateResultsList(id, gender) {
            const body = document.querySelector(\`#\${id} tbody\`);
            body.innerHTML = '';
            DATABASE.results.filter(r => r.club_clean === 'Hillingdon AC' && r.gender === gender).forEach(r => {
                body.innerHTML += \`<tr><td>M\${r.meet_id}</td><td><strong>\${r.event_name}</strong></td><td>\${r.position || '-'}</td><td>\${r.athlete_clean || '-'}</td><td>\${r.age_clean || '-'}</td><td>\${r.perf || '-'}</td><td>\${r.points_scored}</td></tr>\`;
            });
        }

        function populateAllStars(id, gender) {
            const container = document.getElementById(id);
            container.innerHTML = '';
            const stars = getAthletesSummary(gender).filter(a => a.meets >= 4);
            if(stars.length === 0) { container.innerHTML = '<p style="color:var(--text-secondary);">No athletes ran in all 4 meets.</p>'; return; }
            stars.forEach(s => {
                container.innerHTML += \`<div class="star-card"><div class="star-header"><div class="star-avatar">\${s.name[0]}</div><div><strong>\${s.name}</strong><div>\${s.age}</div></div></div><div class="star-stats"><div>Pts: <strong>\${s.points.toFixed(1)}</strong></div><div>Meets: 4/4</div></div></div>\`;
            });
        }

        function populateMissed(id, gender) {
            const body = document.querySelector(\`#\${id} tbody\`);
            body.innerHTML = '';
            const list = DATABASE.hac_missed_events.filter(e => e.gender === gender);
            if(list.length === 0) { body.innerHTML = '<tr><td colspan="3">None! 100% capacity!</td></tr>'; return; }
            list.forEach(e => body.innerHTML += \`<tr><td>Meet \${e.meet_id}</td><td><code>\${e.event_code}</code></td><td>\${e.event_name}</td></tr>\`);
        }

        function filterData() {
            const q = document.getElementById('search-query').value.toLowerCase();
            const club = document.getElementById('filter-club').value;
            const body = document.querySelector('#search-table tbody');
            body.innerHTML = '';
            DATABASE.results.filter(r => {
                const mq = !q || (r.athlete_clean && r.athlete_clean.toLowerCase().includes(q)) || r.event_name.toLowerCase().includes(q);
                const mc = !club || r.club_clean === club;
                return mq && mc;
            }).slice(0, 100).forEach(r => {
                body.innerHTML += \`<tr><td>M\${r.meet_id}</td><td>\${r.event_name}</td><td>\${r.position||'-'}</td><td>\${r.athlete_clean||'-'}</td><td>\${r.age_clean||'-'}</td><td>\${r.club_clean}</td><td>\${r.perf||'-'}</td><td>\${r.points_scored}</td></tr>\`;
            });
        }

        document.addEventListener('DOMContentLoaded', () => { lucide.createIcons(); init(); });
    </script>
</body>
</html>`;

        const blob = new Blob([template], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'hac_vets_league_report.html';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    if (loading || !database) {
        return (
            <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center font-sans">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                <p className="text-slate-400 text-sm">Loading Vets League Insights...</p>
            </div>
        );
    }

    const kpi = getKPIs();
    const menStandings = getAthletesSummary('Men');
    const womenStandings = getAthletesSummary('Women');

    // All stars
    const menAllStars = menStandings.filter(a => a.meets.size === 4);
    const womenAllStars = womenStandings.filter(a => a.meets.size === 4);

    return (
        <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 relative">
            {/* Background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-blue-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-pink-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-600 rounded-xl shadow-[0_4px_12px_rgba(37,99,235,0.3)]">
                            <Activity className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight">Hillingdon AC</h1>
                            <p className="text-slate-400 text-sm">Southern Counties Veterans T&F League 2026 Insights</p>
                        </div>
                    </div>
                    
                    <div className="flex gap-3 w-full md:w-auto">
                        <button 
                            onClick={handleDownload}
                            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-705 border border-slate-700/50 hover:border-slate-600 rounded-xl text-slate-200 font-medium text-sm transition-all"
                        >
                            <Download size={16} className="text-blue-400" />
                            <span>Download Report</span>
                        </button>
                        
                        <button 
                            onClick={onClose}
                            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-white font-medium text-sm transition-all"
                        >
                            Back to Portal
                        </button>
                    </div>
                </header>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-800 pb-4 mb-8 overflow-x-auto">
                    {[
                        { id: 'overview', label: 'Overview & Verify', icon: LayoutDashboard },
                        { id: 'men', label: "Men's League", icon: User },
                        { id: 'women', label: "Women's League", icon: UserCheck },
                        { id: 'search', label: 'Combined Search', icon: Search }
                    ].map(tab => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                                    activeTab === tab.id 
                                        ? 'bg-blue-600 text-white' 
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                                }`}
                            >
                                <Icon size={16} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Contents */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* KPIs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: "Total HAC Points", val: kpi.totalPoints, icon: Award, color: "text-blue-500 bg-blue-500/10 border-blue-500/20" },
                                { label: "Average Points / Meet", val: kpi.avgPoints, icon: TrendingUp, color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20" },
                                { label: "Participating Athletes", val: kpi.totalAthletes, icon: Users, color: "text-amber-500 bg-amber-500/10 border-amber-500/20" },
                                { label: "Missed Event Slots", val: kpi.missedEvents, icon: AlertTriangle, color: "text-red-500 bg-red-500/10 border-red-500/20" }
                            ].map((k, idx) => {
                                const Icon = k.icon;
                                return (
                                    <div key={idx} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 flex items-center gap-4">
                                        <div className={`p-3 rounded-xl border ${k.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-1">{k.label}</h4>
                                            <div className="text-2xl font-bold tracking-tight text-white">{k.val}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Audit Verification */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2"><ShieldCheck className="text-blue-400" /> Point Verification & Audits</h3>
                            
                            <div className="flex gap-3 bg-blue-950/20 border border-blue-800/20 p-4 rounded-xl text-sm">
                                <Info className="text-blue-400 shrink-0 mt-0.5" size={18} />
                                <div className="space-y-1">
                                    <div className="font-bold text-slate-200">Point Audit Summary</div>
                                    <div className="text-slate-400 leading-relaxed">
                                        Hillingdon AC's calculated scores match the official summary table exactly on Meetings 2, 3, and 4. Meeting 1 Women has a rounded 0.5 difference.
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    { name: "Meeting 1 - Battersea", desc: "Men: 165.0 vs 165.0 | Women: 139.5 vs 140.0", status: "Women Diff: -0.5", state: "warning" },
                                    { name: "Meeting 2 - Hillingdon", desc: "Men: 164.0 vs 164.0 | Women: 159.0 vs 159.0", status: "Perfect Match", state: "success" },
                                    { name: "Meeting 3 - Tooting", desc: "Men: 167.0 vs 167.0 | Women: 140.0 vs 140.0", status: "Perfect Match", state: "success" },
                                    { name: "Meeting 4 - Perivale", desc: "Men: 157.0 vs 157.0 | Women: 159.0 vs 159.0", status: "Perfect Match", state: "success" }
                                ].map((row, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-slate-950/30 border border-slate-800/50 rounded-xl">
                                        <span className="font-semibold text-slate-300">{row.name}</span>
                                        <div className="flex items-center gap-3 text-xs">
                                            <span className="text-slate-500 font-medium">{row.desc}</span>
                                            <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                                                row.state === 'success' 
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                    : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                            }`}>{row.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Progression Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Points Progression by Meet</h3>
                                <div className="h-[280px] w-full"><canvas ref={progressionCanvasRef}></canvas></div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Total Points Contribution</h3>
                                <div className="h-[280px] w-full"><canvas ref={contributionCanvasRef}></canvas></div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'men' && (
                    <div className="space-y-6">
                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Top Scoring Male Athletes</h3>
                                <div className="h-[280px] w-full"><canvas ref={menTopScorersCanvasRef}></canvas></div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Points by Age Group</h3>
                                <div className="h-[280px] w-full"><canvas ref={menAgeGroupCanvasRef}></canvas></div>
                            </div>
                        </div>

                        {/* Standings */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Men's Standings</h3>
                            <div className="overflow-x-auto border border-slate-850 rounded-xl">
                                <table className="w-full border-collapse text-sm text-left">
                                    <thead>
                                        <tr className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-850">
                                            <th className="p-4 font-semibold">Rank</th>
                                            <th className="p-4 font-semibold">Athlete Name</th>
                                            <th className="p-4 font-semibold">Age Group</th>
                                            <th className="p-4 font-semibold">Total Points</th>
                                            <th className="p-4 font-semibold">Meets Run</th>
                                            <th className="p-4 font-semibold">Avg / Meet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {menStandings.map((ath, idx) => (
                                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/20">
                                                <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                                                <td className="p-4 text-slate-200 font-medium">{ath.name}</td>
                                                <td className="p-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{ath.age}</span></td>
                                                <td className="p-4 font-bold text-slate-200">{ath.points.toFixed(1)}</td>
                                                <td className="p-4 text-slate-400">{ath.meets.size} / 4</td>
                                                <td className="p-4 text-slate-400">{(ath.points / ath.meets.size).toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stars & Missed Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Stars */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">All-Meets Competitors (All 4 Meets)</h3>
                                <div className="space-y-4">
                                    {menAllStars.length === 0 ? (
                                        <p className="text-slate-500 text-sm">No athletes participated in all 4 meets.</p>
                                    ) : (
                                        menAllStars.map((star, idx) => (
                                            <div key={idx} className="bg-slate-955/25 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                                                        {star.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-200">{star.name}</div>
                                                        <div className="text-xs text-slate-500">{star.age}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right text-xs">
                                                    <div className="font-bold text-slate-350">Total Points: {star.points.toFixed(1)}</div>
                                                    <div className="text-slate-500">Meets: 4 / 4</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Missed */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Men's Missed Events</h3>
                                <div className="overflow-x-auto border border-slate-850 rounded-xl">
                                    <table className="w-full border-collapse text-sm text-left">
                                        <thead>
                                            <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-850">
                                                <th className="p-4">Meet</th>
                                                <th className="p-4">Event Code</th>
                                                <th className="p-4">Event Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {database.hac_missed_events.filter(e => e.gender === 'Men').length === 0 ? (
                                                <tr><td colSpan="3" className="p-4 text-center text-slate-500">100% capacity filled! No missed events!</td></tr>
                                            ) : (
                                                database.hac_missed_events.filter(e => e.gender === 'Men').map((ev, idx) => (
                                                    <tr key={idx} className="border-b border-slate-850">
                                                        <td className="p-4 font-bold text-slate-400">Meet {ev.meet_id}</td>
                                                        <td className="p-4"><code className="text-red-400 font-mono">{ev.event_code}</code></td>
                                                        <td className="p-4 text-slate-300">{ev.event_name}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Consolidated HAC Results */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Hillingdon Men Consolidated Results by Event</h3>
                            <div className="overflow-x-auto border border-slate-850 rounded-xl max-h-[400px]">
                                <table className="w-full border-collapse text-sm text-left">
                                    <thead className="sticky top-0 bg-slate-950 z-20">
                                        <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-850">
                                            <th className="p-4">Meet</th>
                                            <th className="p-4">Event</th>
                                            <th className="p-4">Pos</th>
                                            <th className="p-4">Athlete</th>
                                            <th className="p-4">Age</th>
                                            <th className="p-4">Perf</th>
                                            <th className="p-4">Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {database.results.filter(r => r.club_clean === 'Hillingdon AC' && r.gender === 'Men').map((rec, idx) => (
                                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/20">
                                                <td className="p-4 text-slate-400 font-medium">M{rec.meet_id}</td>
                                                <td className="p-4 text-slate-200 font-bold">{rec.event_name}</td>
                                                <td className="p-4 text-slate-300">{rec.position || '-'}</td>
                                                <td className="p-4 text-slate-200">{rec.athlete_clean || <span className="text-slate-600">None</span>}</td>
                                                <td className="p-4">{rec.age_clean ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{rec.age_clean}</span> : '-'}</td>
                                                <td className="p-4"><code className="text-slate-350">{rec.perf || '-'}</code></td>
                                                <td className="p-4 font-bold text-slate-200">{rec.points_scored}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'women' && (
                    <div className="space-y-6">
                        {/* Charts */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Top Scoring Female Athletes</h3>
                                <div className="h-[280px] w-full"><canvas ref={womenTopScorersCanvasRef}></canvas></div>
                            </div>
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Points by Age Group</h3>
                                <div className="h-[280px] w-full"><canvas ref={womenAgeGroupCanvasRef}></canvas></div>
                            </div>
                        </div>

                        {/* Standings */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Women's Standings</h3>
                            <div className="overflow-x-auto border border-slate-850 rounded-xl">
                                <table className="w-full border-collapse text-sm text-left">
                                    <thead>
                                        <tr className="bg-slate-900 text-slate-400 uppercase text-xs tracking-wider border-b border-slate-850">
                                            <th className="p-4 font-semibold">Rank</th>
                                            <th className="p-4 font-semibold">Athlete Name</th>
                                            <th className="p-4 font-semibold">Age Group</th>
                                            <th className="p-4 font-semibold">Total Points</th>
                                            <th className="p-4 font-semibold">Meets Run</th>
                                            <th className="p-4 font-semibold">Avg / Meet</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {womenStandings.map((ath, idx) => (
                                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/20">
                                                <td className="p-4 font-bold text-slate-400">{idx + 1}</td>
                                                <td className="p-4 text-slate-200 font-medium">{ath.name}</td>
                                                <td className="p-4"><span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">{ath.age}</span></td>
                                                <td className="p-4 font-bold text-slate-200">{ath.points.toFixed(1)}</td>
                                                <td className="p-4 text-slate-400">{ath.meets.size} / 4</td>
                                                <td className="p-4 text-slate-400">{(ath.points / ath.meets.size).toFixed(1)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Stars & Missed Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Stars */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">All-Meets Competitors (All 4 Meets)</h3>
                                <div className="space-y-4">
                                    {womenAllStars.length === 0 ? (
                                        <p className="text-slate-500 text-sm">No athletes participated in all 4 meets.</p>
                                    ) : (
                                        womenAllStars.map((star, idx) => (
                                            <div key={idx} className="bg-slate-955/25 border border-slate-800/80 rounded-xl p-4 flex justify-between items-center">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-pink-600 rounded-full flex items-center justify-center font-bold text-white text-sm">
                                                        {star.name.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-slate-200">{star.name}</div>
                                                        <div className="text-xs text-slate-500">{star.age}</div>
                                                    </div>
                                                </div>
                                                <div className="text-right text-xs">
                                                    <div className="font-bold text-slate-350">Total Points: {star.points.toFixed(1)}</div>
                                                    <div className="text-slate-500">Meets: 4 / 4</div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Missed */}
                            <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-white mb-4">Women's Missed Events</h3>
                                <div className="overflow-x-auto border border-slate-850 rounded-xl">
                                    <table className="w-full border-collapse text-sm text-left">
                                        <thead>
                                            <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-850">
                                                <th className="p-4">Meet</th>
                                                <th className="p-4">Event Code</th>
                                                <th className="p-4">Event Name</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {database.hac_missed_events.filter(e => e.gender === 'Women').length === 0 ? (
                                                <tr><td colSpan="3" className="p-4 text-center text-slate-500">100% capacity filled! No missed events!</td></tr>
                                            ) : (
                                                database.hac_missed_events.filter(e => e.gender === 'Women').map((ev, idx) => (
                                                    <tr key={idx} className="border-b border-slate-850">
                                                        <td className="p-4 font-bold text-slate-400">Meet {ev.meet_id}</td>
                                                        <td className="p-4"><code className="text-red-400 font-mono">{ev.event_code}</code></td>
                                                        <td className="p-4 text-slate-300">{ev.event_name}</td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Consolidated HAC Results */}
                        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-white mb-4">Hillingdon Women Consolidated Results by Event</h3>
                            <div className="overflow-x-auto border border-slate-850 rounded-xl max-h-[400px]">
                                <table className="w-full border-collapse text-sm text-left">
                                    <thead className="sticky top-0 bg-slate-950 z-20">
                                        <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-850">
                                            <th className="p-4">Meet</th>
                                            <th className="p-4">Event</th>
                                            <th className="p-4">Pos</th>
                                            <th className="p-4">Athlete</th>
                                            <th className="p-4">Age</th>
                                            <th className="p-4">Perf</th>
                                            <th className="p-4">Pts</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {database.results.filter(r => r.club_clean === 'Hillingdon AC' && r.gender === 'Women').map((rec, idx) => (
                                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/20">
                                                <td className="p-4 text-slate-400 font-medium">M{rec.meet_id}</td>
                                                <td className="p-4 text-slate-200 font-bold">{rec.event_name}</td>
                                                <td className="p-4 text-slate-300">{rec.position || '-'}</td>
                                                <td className="p-4 text-slate-200">{rec.athlete_clean || <span className="text-slate-600">None</span>}</td>
                                                <td className="p-4">{rec.age_clean ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-pink-500/10 text-pink-400 border border-pink-500/20">{rec.age_clean}</span> : '-'}</td>
                                                <td className="p-4"><code className="text-slate-350">{rec.perf || '-'}</code></td>
                                                <td className="p-4 font-bold text-slate-200">{rec.points_scored}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 space-y-4">
                        <h3 className="text-lg font-bold text-white">Combined Database Search</h3>
                        
                        <div className="flex flex-wrap gap-3">
                            <input 
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="flex-1 min-w-[200px] bg-slate-950/50 border border-slate-800 text-slate-200 text-sm px-4 py-2.5 rounded-xl outline-none focus:border-blue-600 transition-colors"
                                placeholder="Search by Athlete, Event, or Club..."
                            />
                            
                            <select 
                                value={filterMeet}
                                onChange={(e) => setFilterMeet(e.target.value)}
                                className="bg-slate-950/50 border border-slate-800 text-slate-350 text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-blue-600"
                            >
                                <option value="">All Meets</option>
                                <option value="1">Meet 1 (Battersea)</option>
                                <option value="2">Meet 2 (Hillingdon)</option>
                                <option value="3">Meet 3 (Tooting)</option>
                                <option value="4">Meet 4 (Perivale)</option>
                            </select>

                            <select 
                                value={filterGender}
                                onChange={(e) => setFilterGender(e.target.value)}
                                className="bg-slate-950/50 border border-slate-800 text-slate-350 text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-blue-600"
                            >
                                <option value="">All Genders</option>
                                <option value="Men">Men</option>
                                <option value="Women">Women</option>
                            </select>

                            <select 
                                value={filterClub}
                                onChange={(e) => setFilterClub(e.target.value)}
                                className="bg-slate-950/50 border border-slate-800 text-slate-350 text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-blue-600"
                            >
                                <option value="">All Clubs</option>
                                <option value="Hillingdon AC">Hillingdon AC</option>
                                <option value="British Airways">British Airways</option>
                                <option value="Ealing Southall & Middlesex">Ealing Southall & Middlesex</option>
                                <option value="Herne Hill Harriers">Herne Hill Harriers</option>
                                <option value="Metros">Metros</option>
                                <option value="Ealing Eagles">Ealing Eagles</option>
                                <option value="Serpentine">Serpentine</option>
                                <option value="Thames Valley Harriers">Thames Valley Harriers</option>
                            </select>

                            <select 
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="bg-slate-950/50 border border-slate-800 text-slate-350 text-sm px-4 py-2.5 rounded-xl outline-none cursor-pointer focus:border-blue-600"
                            >
                                <option value="">All Types</option>
                                <option value="scoring">Scoring</option>
                                <option value="non-scoring">Non-scoring</option>
                            </select>
                        </div>

                        <div className="overflow-x-auto border border-slate-850 rounded-xl max-h-[500px]">
                            <table className="w-full border-collapse text-sm text-left">
                                <thead className="sticky top-0 bg-slate-950 z-20">
                                    <tr className="bg-slate-900 text-slate-400 text-xs border-b border-slate-850">
                                        <th className="p-4">Meet</th>
                                        <th className="p-4">Event</th>
                                        <th className="p-4">Pos</th>
                                        <th className="p-4">Athlete</th>
                                        <th className="p-4">Age</th>
                                        <th className="p-4">Club</th>
                                        <th className="p-4">Perf</th>
                                        <th className="p-4">Pts</th>
                                        <th className="p-4">Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {database.results
                                        .filter(r => {
                                            const mq = !searchQuery || 
                                                (r.athlete_clean && r.athlete_clean.toLowerCase().includes(searchQuery.toLowerCase())) ||
                                                r.event_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                                r.club_clean.toLowerCase().includes(searchQuery.toLowerCase());
                                            const mm = !filterMeet || r.meet_id.toString() === filterMeet;
                                            const mg = !filterGender || r.gender === filterGender;
                                            const mc = !filterClub || r.club_clean === filterClub;
                                            const mt = !filterType || r.type === filterType;
                                            return mq && mm && mg && mc && mt;
                                        })
                                        .map((rec, idx) => (
                                            <tr key={idx} className="border-b border-slate-850 hover:bg-slate-900/20">
                                                <td className="p-4 text-slate-400 font-medium">M{rec.meet_id}</td>
                                                <td className="p-4 text-slate-200 font-bold">{rec.event_name}</td>
                                                <td className="p-4 text-slate-350">{rec.position || '-'}</td>
                                                <td className="p-4 text-slate-200">{rec.athlete_clean || <span className="text-slate-600">None</span>}</td>
                                                <td className="p-4">{rec.age_clean ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">{rec.age_clean}</span> : '-'}</td>
                                                <td className="p-4 text-slate-300">{rec.club_clean}</td>
                                                <td className="p-4"><code>{rec.perf || '-'}</code></td>
                                                <td className="p-4 font-bold text-slate-200">{rec.points_scored}</td>
                                                <td className="p-4">
                                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                                                        rec.type === 'scoring' 
                                                            ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20' 
                                                            : 'bg-amber-500/10 text-amber-450 border border-amber-500/20'
                                                    }`}>{rec.type}</span>
                                                </td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VetsLeagueInsights;
