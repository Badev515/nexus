import { useEffect, useState } from 'react';
import { Box, Stack, Card, CardMedia, Typography, Rating, Skeleton, Grid } from '@mui/material';
import CompareBar from './CompareBar';
import CompareChart from './CompareChart';
import { searchApps } from '../api/playstore.api';

const COLORS = ['#4285F4', '#EA4335', '#0E9F6E'];

function MiniAppCard({ keyword, color, loading, app }) {
  if (loading) {
    return (
      <Card sx={{ borderRadius: 2, p: 1.5, border: `2px solid ${color}22` }} elevation={0}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="rounded" width={44} height={44} />
          <Stack flex={1} spacing={0.5}>
            <Skeleton width="70%" height={18} />
            <Skeleton width="40%" height={14} />
          </Stack>
        </Stack>
      </Card>
    );
  }

  if (!app) {
    return (
      <Card sx={{ borderRadius: 2, p: 1.5, border: `2px solid ${color}22` }} elevation={0}>
        <Typography variant="caption" color="text.secondary">No app found for "{keyword}"</Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ borderRadius: 2, p: 1.5, border: `2px solid ${color}44` }} elevation={0}>
      <Stack direction="row" spacing={1.5} alignItems="center">
        <CardMedia component="img" image={app.icon} alt={app.title} sx={{ width: 44, height: 44, borderRadius: 1.5 }} />
        <Stack flex={1} minWidth={0}>
          <Typography variant="body2" fontWeight={700} noWrap>{app.title}</Typography>
          <Rating value={app.score || 0} precision={0.1} readOnly size="small" />
        </Stack>
        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: color, flexShrink: 0 }} />
      </Stack>
    </Card>
  );
}

export default function CompareView({ keywords, onChange, country, geo, range }) {
  const [apps, setApps] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (keywords.length === 0) return;
    let cancelled = false;
    setLoading(true);

    Promise.allSettled(keywords.map((kw) => searchApps(kw, country))).then((results) => {
      if (cancelled) return;
      const next = {};
      results.forEach((res, idx) => {
        next[keywords[idx]] = res.status === 'fulfilled' && res.value?.length ? res.value[0] : null;
      });
      setApps(next);
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [keywords.join('|'), country]);

  return (
    <Stack spacing={2}>
      <CompareBar keywords={keywords} onChange={onChange} />

      {keywords.length >= 2 && (
        <>
          <Grid container spacing={1.5}>
            {keywords.map((kw, idx) => (
              <Grid item xs={12} sm={4} key={kw}>
                <MiniAppCard keyword={kw} color={COLORS[idx]} loading={loading} app={apps[kw]} />
              </Grid>
            ))}
          </Grid>

          <CompareChart keywords={keywords} geo={geo} range={range} />
        </>
      )}
    </Stack>
  );
}