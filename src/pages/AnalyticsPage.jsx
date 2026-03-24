import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TopBar }        from '../components/layout/TopBar.jsx';
import { Spinner }       from '../components/ui/Spinner.jsx';
import { useAnalytics }  from '../hooks/useAnalytics.js';
import useExerciseStore  from '../stores/exerciseStore.js';
import useAuthStore      from '../stores/authStore.js';

const CHART_THEME = {
  fill:      '#6366f1',
  stroke:    '#818cf8',
  gridColor: '#27272a',
  textColor: '#71717a',
  tooltip: {
    contentStyle: { background: '#18181b', border: '1px solid #3f3f46', borderRadius: 12, color: '#fff' },
    labelStyle:   { color: '#a1a1aa' },
  },
};

function StatCard({ label, value, sub }) {
  return (
    <div className="card px-4 py-4 text-center">
      <p className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">{label}</p>
      <p className="text-xl font-bold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-surface-500 mt-0.5">{sub}</p>}
    </div>
  );
}

function fmtVol(v) {
  return v >= 1000 ? `${(v / 1000).toFixed(1)}t` : `${v}kg`;
}

function fmtDuration(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function AnalyticsPage() {
  const { user }    = useAuthStore();
  const { loading, getWeeklyVolume, getStrengthTrend, getSummaryStats } = useAnalytics();
  const exercises   = useExerciseStore((s) => s.exercises);

  const [weeklyData,   setWeeklyData]   = useState([]);
  const [strengthData, setStrengthData] = useState([]);
  const [stats,        setStats]        = useState(null);
  const [selectedEx,   setSelectedEx]   = useState('');

  useEffect(() => {
    if (!user) return;
    getSummaryStats().then(setStats);
    getWeeklyVolume(8).then(setWeeklyData);
  }, [user]);

  const loadStrength = useCallback(async (exId) => {
    if (!exId) return;
    setSelectedEx(exId);
    const data = await getStrengthTrend(exId, 12);
    setStrengthData(data);
  }, [getStrengthTrend]);

  // Only show exercises that have local data (non-empty)
  const exerciseOptions = useMemo(() =>
    exercises.slice(0, 60).sort((a, b) => a.name.localeCompare(b.name)),
  [exercises]);

  return (
    <div>
      <TopBar title="Progress" />

      <div className="px-4 py-5 flex flex-col gap-6">
        {/* Summary stats */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Workouts"  value={stats.totalWorkouts} />
            <StatCard label="Total Vol" value={fmtVol(stats.totalVolume)} sub="lifted" />
            <StatCard label="Time"      value={fmtDuration(stats.totalDuration)} sub="trained" />
          </div>
        )}

        {/* Weekly volume chart */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Volume (kg)</h3>
          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : weeklyData.every(d => d.volume === 0) ? (
            <p className="text-center text-sm text-surface-500 py-6">Log workouts to see volume trends.</p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={weeklyData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: CHART_THEME.textColor, fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_THEME.textColor, fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(1)}t` : v}
                />
                <Tooltip
                  contentStyle={CHART_THEME.tooltip.contentStyle}
                  labelStyle={CHART_THEME.tooltip.labelStyle}
                  formatter={(v) => [`${v}kg`, 'Volume']}
                />
                <Bar dataKey="volume" fill={CHART_THEME.fill} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Strength trend chart */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Strength Trend</h3>

          {/* Exercise selector */}
          <select
            value={selectedEx}
            onChange={(e) => loadStrength(e.target.value)}
            className="input-base w-full mb-4 text-sm"
          >
            <option value="">Select an exercise…</option>
            {exerciseOptions.map((ex) => (
              <option key={ex.id} value={ex.id}>{ex.name}</option>
            ))}
          </select>

          {loading ? (
            <div className="flex justify-center py-8"><Spinner /></div>
          ) : !selectedEx ? (
            <p className="text-center text-sm text-surface-500 py-6">Choose an exercise above.</p>
          ) : strengthData.length < 2 ? (
            <p className="text-center text-sm text-surface-500 py-6">
              Need 2+ sessions to show trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={strengthData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_THEME.gridColor} vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fill: CHART_THEME.textColor, fontSize: 10 }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fill: CHART_THEME.textColor, fontSize: 10 }}
                  axisLine={false} tickLine={false}
                  tickFormatter={(v) => `${v}kg`}
                />
                <Tooltip
                  contentStyle={CHART_THEME.tooltip.contentStyle}
                  labelStyle={CHART_THEME.tooltip.labelStyle}
                  formatter={(v) => [`${v}kg`, 'Max Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke={CHART_THEME.stroke}
                  strokeWidth={2}
                  dot={{ fill: CHART_THEME.stroke, r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#fff' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
