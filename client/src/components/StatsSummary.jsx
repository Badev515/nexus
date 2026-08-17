import { Box, Stack, Typography, Skeleton } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import TagIcon from '@mui/icons-material/Tag';

function StatBlock({ icon, label, value, loading }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ flex: 1, minWidth: 140 }}>
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 2,
          bgcolor: 'rgba(14,159,110,0.1)',
          color: '#0E9F6E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="caption" color="text.secondary" noWrap>
          {label}
        </Typography>
        {loading ? (
          <Skeleton width={50} height={22} />
        ) : (
          <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>
            {value}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

export default function StatsSummary({ app, trendData, relatedWordsCount, loading }) {
  if (!app && !loading && relatedWordsCount === null) return null;

  const avgInterest =
    trendData && trendData.length
      ? Math.round(trendData.reduce((sum, d) => sum + (d.value?.[0] ?? 0), 0) / trendData.length)
      : null;

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #E4E8EE',
        borderRadius: 3,
        p: 2.25,
      }}
      className="fade-in"
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <StatBlock
          icon={<StarIcon sx={{ fontSize: 18 }} />}
          label="App Rating"
          value={app?.score ? app.score.toFixed(1) : '—'}
          loading={loading}
        />
        <StatBlock
          icon={<TrendingUpIcon sx={{ fontSize: 18 }} />}
          label="Avg. Search Interest"
          value={avgInterest !== null ? avgInterest : '—'}
          loading={loading}
        />
        <StatBlock
          icon={<TagIcon sx={{ fontSize: 18 }} />}
          label="Related Keywords Found"
          value={relatedWordsCount !== null ? relatedWordsCount : '…'}
          loading={loading}
        />
      </Stack>
    </Box>
  );
}