import { useEffect, useState } from 'react';
import { Card, Typography, Skeleton, Box } from '@mui/material';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { getTrend } from '../api/trends.api';

const COLORS = ['#4285F4', '#EA4335', '#0E9F6E'];

export default function CompareChart({ keywords, geo, range }) {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keywords.length < 2) return;
    let cancelled = false;
    setLoading(true);

    Promise.allSettled(keywords.map((kw) => getTrend(kw, geo, range))).then((results) => {
      if (cancelled) return;

      const series = results.map((res) =>
        res.status === 'fulfilled' ? res.value?.default?.timelineData || [] : []
      );

      const maxLen = Math.max(...series.map((s) => s.length), 0);
      const merged = [];
      for (let i = 0; i < maxLen; i++) {
        const point = { date: series[0]?.[i]?.formattedTime || '' };
        keywords.forEach((kw, idx) => {
          point[kw] = series[idx]?.[i]?.value?.[0] ?? null;
        });
        merged.push(point);
      }

      setChartData(merged);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [keywords.join('|'), geo, range]);

  if (keywords.length < 2) return null;

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 2.5 }} elevation={0}>
        <Skeleton width="40%" height={22} sx={{ mb: 2 }} />
        <Skeleton variant="rounded" height={220} />
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 3, p: 2.5 }} elevation={0}>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>Search Interest Comparison</Typography>
      <Box sx={{ height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8A94A3' }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 10, fill: '#8A94A3' }} width={28} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E4E8EE' }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            {keywords.map((kw, idx) => (
              <Line key={kw} type="monotone" dataKey={kw} stroke={COLORS[idx]} strokeWidth={2.5} dot={false} connectNulls />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}