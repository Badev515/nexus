import { Card, Typography, Skeleton, Stack, ToggleButtonGroup, ToggleButton, Box, CircularProgress } from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ACCENT = '#0E9F6E';
const ACCENT_DARK = '#0B7A54';
const INK = '#0B1220';

const RANGES = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '1m', label: '1MO' },
  { value: '3m', label: '3MO' },
  { value: '6m', label: '6MO' },
  { value: '12m', label: '12MO' },
];

export default function TrendChart({ data, keyword, loading, range, onRangeChange }) {
  const handleRangeChange = (e, newRange) => {
    if (newRange) onRangeChange && onRangeChange(newRange);
  };

  const rangeSelector = (
    <Box
      sx={{
        overflowX: 'auto',
        maxWidth: '100%',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': { display: 'none' },
        scrollbarWidth: 'none',
      }}
    >
      <ToggleButtonGroup
        value={range}
        exclusive
        onChange={handleRangeChange}
        size="small"
        sx={{
          flexWrap: 'nowrap',
          '& .MuiToggleButton-root': {
            textTransform: 'none',
            fontSize: '0.72rem',
            fontFamily: `'JetBrains Mono', monospace`,
            fontWeight: 600,
            px: 1.2,
            py: 0.3,
            whiteSpace: 'nowrap',
            border: '1px solid #E4E8EE',
            color: '#6B7690',
            transition: 'background-color 0.15s, color 0.15s',
            '&.Mui-selected': {
              bgcolor: ACCENT,
              color: '#fff',
              '&:hover': { bgcolor: ACCENT_DARK },
            },
          },
        }}
      >
        {RANGES.map((r) => (
          <ToggleButton key={r.value} value={r.value}>
            {r.label}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Box>
  );

  // Pehli baar load ho raha hai aur abhi tak koi data nahi — sirf tab full skeleton
  if (loading && (!data || !data.length)) {
    return (
      <Card sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 } }} elevation={0}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
          <Skeleton width="35%" height={22} />
          {rangeSelector}
        </Stack>
        <Skeleton variant="rounded" width="100%" height={200} />
      </Card>
    );
  }

  // Kabhi bhi data nahi mila (na purana na naya)
  if (!data || !data.length) {
    return (
      <Card sx={{ borderRadius: 3, p: { xs: 2, sm: 2.5 }, textAlign: 'center' }} elevation={0}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          Search interest — <Box component="span" sx={{ color: ACCENT }}>{keyword}</Box>
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Trend data abhi temporarily unavailable hai. Thodi der baad dobara try karein.
        </Typography>
        <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>{rangeSelector}</Box>
      </Card>
    );
  }

  const chartData = data.map((d) => ({ date: d.formattedTime, value: d.value?.[0] ?? 0 }));
  const current = chartData[chartData.length - 1]?.value ?? 0;
  const peak = chartData.reduce((max, p) => (typeof p.value === 'number' && p.value > max ? p.value : max), 0);

  return (
    <Card
      sx={{
        borderRadius: 3,
        p: { xs: 2, sm: 2.5 },
        position: 'relative',
        border: '1px solid #E4E8EE',
        boxShadow: '0 1px 3px rgba(11,18,32,0.05)',
      }}
      elevation={0}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        sx={{ mb: 2 }}
        gap={1.25}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0 }}>
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
              flexShrink: 0,
            }}
          >
            <TrendingUpIcon sx={{ fontSize: 16, color: '#fff' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography noWrap sx={{ fontWeight: 700, fontSize: '0.95rem', color: INK }}>
              {keyword}
            </Typography>
            <Typography variant="caption" sx={{ color: '#8B93A7' }}>
              Search interest over time
            </Typography>
          </Box>
          {/* Range change ke waqt purana data dikhta rahe, bas chhota loading indicator */}
          {loading && <CircularProgress size={14} thickness={6} sx={{ color: ACCENT, flexShrink: 0 }} />}
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}>
          <Stack direction="row" spacing={1.5} sx={{ mr: { sm: 1 } }}>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: INK, lineHeight: 1.1 }}>{current}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#8B93A7', fontWeight: 600, letterSpacing: '0.02em' }}>
                CURRENT
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '1.05rem', fontWeight: 800, color: ACCENT_DARK, lineHeight: 1.1 }}>{peak}</Typography>
              <Typography sx={{ fontSize: '0.65rem', color: '#8B93A7', fontWeight: 600, letterSpacing: '0.02em' }}>
                PEAK
              </Typography>
            </Box>
          </Stack>
        </Stack>
      </Stack>

      {rangeSelector}

      <Box sx={{ mt: 1.5, width: '100%', height: { xs: 180, sm: 220 } }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 8, right: 4, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="trendChartFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={ACCENT} stopOpacity={0.32} />
                <stop offset="100%" stopColor={ACCENT} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#8A94A3' }}
              interval="preserveStartEnd"
              axisLine={{ stroke: '#E4E8EE' }}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 10, fill: '#8A94A3' }} width={28} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 10,
                border: '1px solid #E4E8EE',
                fontSize: '0.78rem',
                boxShadow: '0 8px 24px rgba(11,18,32,0.12)',
              }}
              labelStyle={{ fontWeight: 700, color: INK }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke={ACCENT}
              strokeWidth={2.5}
              fill="url(#trendChartFill)"
              activeDot={{ r: 5, fill: ACCENT, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
