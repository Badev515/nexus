// import { useEffect, useRef, useState } from 'react';
// import { Box, Stack, Typography, Skeleton, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material';
// import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import DownloadIcon from '@mui/icons-material/Download';
// import { getRelatedQueries } from '../api/trends.api';
// import { downloadCSV } from '../utils/csvExport';
// import { useLazyExactCount, getCachedExactCount } from '../hooks/useExactCount';

// function QueryRow({ item, idx, maxValue, country }) {
//   const isBreakout = item.isBreakout;
//   const pct = typeof item.value === 'number' && !isBreakout ? Math.round((item.value / maxValue) * 100) : 0;
//   const isRisingPositive = typeof item.value === 'number' && item.value > 0;
//   const { ref, count, loading } = useLazyExactCount(item.query, country);

//   return (
//     <Stack ref={ref} direction="row" alignItems="center" spacing={1.5}>
//       <Typography sx={{ width: 18, color: '#8B93A7', fontSize: '0.8rem', flexShrink: 0 }}>
//         {idx + 1}
//       </Typography>

//       <Typography noWrap sx={{ flex: 1, minWidth: 0, fontSize: '0.85rem', color: '#0B1220' }}>
//         {item.query}
//       </Typography>

//       <Box sx={{ flexShrink: 0, minWidth: 28, textAlign: 'right' }}>
//         {loading ? (
//           <CircularProgress size={12} thickness={6} sx={{ color: '#0E9F6E' }} />
//         ) : (
//           <Typography
//             sx={{
//               fontSize: '0.72rem',
//               fontWeight: 700,
//               color: count === undefined ? '#C4CAD6' : '#0E9F6E',
//               fontFamily: `'JetBrains Mono', monospace`,
//             }}
//           >
//             {count === undefined ? '…' : count}
//           </Typography>
//         )}
//       </Box>

//       <Box sx={{ width: 60, flexShrink: 0 }}>
//         <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#EEF1F5', overflow: 'hidden' }}>
//           <Box
//             sx={{
//               height: '100%',
//               width: `${isBreakout ? 15 : pct}%`,
//               bgcolor: '#0E9F6E',
//               borderRadius: 3,
//             }}
//           />
//         </Box>
//       </Box>

//       <Box sx={{ flexShrink: 0, minWidth: 56, textAlign: 'right' }}>
//         {isBreakout ? (
//           <Chip
//             label="Breakout"
//             size="small"
//             sx={{ bgcolor: '#0E9F6E', color: '#fff', fontWeight: 700, fontSize: '0.65rem', height: 20 }}
//           />
//         ) : (
//           <Stack direction="row" alignItems="center" spacing={0.25} justifyContent="flex-end">
//             {isRisingPositive ? (
//               <ArrowUpwardIcon sx={{ fontSize: 13, color: '#0E9F6E' }} />
//             ) : (
//               <ArrowDownwardIcon sx={{ fontSize: 13, color: '#D64545' }} />
//             )}
//             <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: isRisingPositive ? '#0E9F6E' : '#D64545' }}>
//               {item.formattedValue || item.value}
//             </Typography>
//           </Stack>
//         )}
//       </Box>
//     </Stack>
//   );
// }

// function QueryColumn({ title, items, loading, country }) {
//   const maxValue = Math.max(...items.map((i) => (typeof i.value === 'number' ? i.value : 0)), 1);

//   return (
//     <Box sx={{ bgcolor: '#fff', border: '1px solid #E4E8EE', borderRadius: 3, p: 2.5, flex: 1, minWidth: 0 }}>
//       <Typography variant="subtitle1" sx={{ mb: 0.25, fontWeight: 700 }}>
//         {title}
//       </Typography>
//       <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
//         Search interest
//       </Typography>

//       {loading && (
//         <Stack spacing={1.5}>
//           {Array.from({ length: 5 }).map((_, i) => (
//             <Skeleton key={i} height={32} variant="rounded" />
//           ))}
//         </Stack>
//       )}

//       {!loading && items.length === 0 && (
//         <Typography variant="body2" color="text.secondary">
//           No data available.
//         </Typography>
//       )}

//       {!loading && items.length > 0 && (
//         <Stack spacing={1.25}>
//           {items.slice(0, 8).map((item, idx) => (
//             <QueryRow key={item.query + idx} item={item} idx={idx} maxValue={maxValue} country={country} />
//           ))}
//         </Stack>
//       )}
//     </Box>
//   );
// }

// export default function RelatedQueries({ keyword, country, range }) {
//   const [data, setData] = useState({ top: [], rising: [] });
//   const [loading, setLoading] = useState(false);
//   const requestId = useRef(0);

//   useEffect(() => {
//     if (!keyword) return;
//     const currentRequest = ++requestId.current;
//     setLoading(true);

//     getRelatedQueries(keyword, country, range)
//       .then((res) => {
//         if (currentRequest !== requestId.current) return;
//         setData(res || { top: [], rising: [] });
//       })
//       .catch(() => {
//         if (currentRequest === requestId.current) setData({ top: [], rising: [] });
//       })
//       .finally(() => {
//         if (currentRequest === requestId.current) setLoading(false);
//       });
//   }, [keyword, country, range]);

//   const handleExportCSV = () => {
//     const rows = [
//       ...data.top.map((i) => ['Top', i.query, i.formattedValue || i.value, getCachedExactCount(i.query, country) ?? '']),
//       ...data.rising.map((i) => ['Rising', i.query, i.formattedValue || i.value, getCachedExactCount(i.query, country) ?? '']),
//     ];
//     downloadCSV(
//       `related-queries-${keyword.replace(/\s+/g, '-')}`,
//       ['Type', 'Query', 'Change', 'Related Count'],
//       rows
//     );
//   };

//   if (!keyword) return null;
//   if (!loading && data.top.length === 0 && data.rising.length === 0) return null;

//   return (
//     <Stack spacing={1.5} className="fade-in">
//       {!loading && (data.top.length > 0 || data.rising.length > 0) && (
//         <Stack direction="row" justifyContent="flex-end">
//           <Tooltip title="Download CSV">
//             <IconButton size="small" onClick={handleExportCSV} sx={{ color: '#6B7690', '&:hover': { color: '#0E9F6E' } }}>
//               <DownloadIcon sx={{ fontSize: 18 }} />
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       )}

//       <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
//         <QueryColumn title="Top queries" items={data.top} loading={loading} country={country} />
//         <QueryColumn title="Rising queries" items={data.rising} loading={loading} country={country} />
//       </Stack>
//     </Stack>
//   );
// }



// import { useEffect, useRef, useState } from 'react';
// import { Box, Stack, Typography, Skeleton, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material';
// import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
// import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
// import DownloadIcon from '@mui/icons-material/Download';
// import OpenInNewIcon from '@mui/icons-material/OpenInNew';
// import { getRelatedQueries } from '../api/trends.api';
// import { downloadCSV } from '../utils/csvExport';
// import { useLazyExactCount, getCachedExactCount } from '../hooks/useExactCount';

// // Project ke brand colors — Top = primary emerald, Rising = secondary blue
// const TOP_COLOR = '#0E9F6E';
// const RISING_COLOR = '#2c45a9';

// function openInPlayStore(query, country) {
//   const url = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps${country ? `&gl=${country}` : ''}`;
//   const newWindow = window.open(url, '_blank');
//   if (newWindow) newWindow.opener = null;
// }

// function QueryRow({ item, idx, maxValue, country, isActive, onQueryClick, accentColor }) {
//   const isBreakout = item.isBreakout;
//   const pct = typeof item.value === 'number' && !isBreakout ? Math.round((item.value / maxValue) * 100) : 0;
//   const isRisingPositive = typeof item.value === 'number' && item.value > 0;
//   const { ref, count, loading } = useLazyExactCount(item.query, country);

//   return (
//     <Stack ref={ref} direction="row" alignItems="flex-start" spacing={{ xs: 0.75, sm: 1.5 }} sx={{ py: 0.25 }}>
//       <Typography sx={{ width: { xs: 14, sm: 18 }, color: '#8B93A7', fontSize: { xs: '0.72rem', sm: '0.8rem' }, flexShrink: 0 }}>
//         {idx + 1}
//       </Typography>

//       <Typography
//         onClick={() => onQueryClick(item.query)}
//         sx={{
//           flex: 1,
//           minWidth: 0,
//           fontSize: { xs: '0.78rem', sm: '0.85rem' },
//           color: isActive ? accentColor : '#0B1220',
//           cursor: 'pointer',
//           wordBreak: 'break-word',
//           lineHeight: 1.3,
//           '&:hover': { color: accentColor, textDecoration: 'underline' },
//         }}
//       >
//         {item.query}
//       </Typography>

//       <Tooltip title="Open in Play Store">
//         <IconButton
//           size="small"
//           onClick={() => openInPlayStore(item.query, country)}
//           sx={{
//             width: { xs: 20, sm: 22 },
//             height: { xs: 20, sm: 22 },
//             borderRadius: '6px',
//             bgcolor: `${accentColor}1F`,
//             color: accentColor,
//             flexShrink: 0,
//             '&:hover': { bgcolor: `${accentColor}33` },
//           }}
//         >
//           <OpenInNewIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
//         </IconButton>
//       </Tooltip>

//       <Box sx={{ flexShrink: 0, minWidth: { xs: 22, sm: 28 }, textAlign: 'right' }}>
//         {loading ? (
//           <CircularProgress size={11} thickness={6} sx={{ color: accentColor }} />
//         ) : (
//           <Typography
//             sx={{
//               fontSize: { xs: '0.65rem', sm: '0.72rem' },
//               fontWeight: 700,
//               color: count === undefined ? '#C4CAD6' : accentColor,
//               fontFamily: `'JetBrains Mono', monospace`,
//             }}
//           >
//             {count === undefined ? '…' : count}
//           </Typography>
//         )}
//       </Box>

//       <Box sx={{ width: 60, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
//         <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#EEF1F5', overflow: 'hidden' }}>
//           <Box
//             sx={{
//               height: '100%',
//               width: `${isBreakout ? 15 : pct}%`,
//               bgcolor: accentColor,
//               borderRadius: 3,
//             }}
//           />
//         </Box>
//       </Box>

//       <Box sx={{ flexShrink: 0, minWidth: { xs: 46, sm: 56 }, textAlign: 'right' }}>
//         {isBreakout ? (
//           <Chip
//             label="Breakout"
//             size="small"
//             sx={{ bgcolor: accentColor, color: '#fff', fontWeight: 700, fontSize: { xs: '0.55rem', sm: '0.65rem' }, height: { xs: 16, sm: 20 } }}
//           />
//         ) : (
//           <Stack direction="row" alignItems="center" spacing={0.25} justifyContent="flex-end">
//             {isRisingPositive ? (
//               <ArrowUpwardIcon sx={{ fontSize: { xs: 11, sm: 13 }, color: accentColor }} />
//             ) : (
//               <ArrowDownwardIcon sx={{ fontSize: { xs: 11, sm: 13 }, color: '#8B93A7' }} />
//             )}
//             <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' }, fontWeight: 600, color: isRisingPositive ? accentColor : '#8B93A7' }}>
//               {item.formattedValue || item.value}
//             </Typography>
//           </Stack>
//         )}
//       </Box>
//     </Stack>
//   );
// }

// function QueryColumn({ title, items, loading, country, activeWord, onQueryClick, accentColor }) {
//   const maxValue = Math.max(...items.map((i) => (typeof i.value === 'number' ? i.value : 0)), 1);

//   return (
//     <Box
//       sx={{
//         bgcolor: '#fff',
//         border: '1px solid #E4E8EE',
//         borderTop: `3px solid ${accentColor}`,
//         borderRadius: 3,
//         p: { xs: 1.5, sm: 2.5 },
//         flex: 1,
//         minWidth: 0,
//       }}
//     >
//       <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
//         <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
//         <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
//           {title}
//         </Typography>
//       </Stack>
//       <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
//         Search interest
//       </Typography>

//       {loading && (
//         <Stack spacing={1.5}>
//           {Array.from({ length: 5 }).map((_, i) => (
//             <Skeleton key={i} height={32} variant="rounded" />
//           ))}
//         </Stack>
//       )}

//       {!loading && items.length === 0 && (
//         <Typography variant="body2" color="text.secondary">
//           No data available.
//         </Typography>
//       )}

//       {!loading && items.length > 0 && (
//         <Box
//           sx={{
//             maxHeight: 420,
//             overflowY: 'auto',
//             pr: 0.5,
//             '&::-webkit-scrollbar': { width: 5 },
//             '&::-webkit-scrollbar-thumb': { bgcolor: accentColor, borderRadius: 4 },
//             '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
//           }}
//         >
//           <Stack spacing={{ xs: 1, sm: 1.25 }}>
//             {items.slice(0, 25).map((item, idx) => (
//               <QueryRow
//                 key={item.query + idx}
//                 item={item}
//                 idx={idx}
//                 maxValue={maxValue}
//                 country={country}
//                 isActive={item.query === activeWord}
//                 onQueryClick={onQueryClick}
//                 accentColor={accentColor}
//               />
//             ))}
//           </Stack>
//         </Box>
//       )}
//     </Box>
//   );
// }

// export default function RelatedQueries({ keyword, country, range, onSearchThis }) {
//   const [data, setData] = useState({ top: [], rising: [] });
//   const [loading, setLoading] = useState(false);
//   const [retryTick, setRetryTick] = useState(0);
//   const requestId = useRef(0);

//   useEffect(() => {
//     if (!keyword) return;
//     const currentRequest = ++requestId.current;
//     setLoading(true);

//     getRelatedQueries(keyword, country, range)
//       .then((res) => {
//         if (currentRequest !== requestId.current) return;
//         setData(res || { top: [], rising: [] });
//       })
//       .catch(() => {
//         if (currentRequest === requestId.current) setData({ top: [], rising: [] });
//       })
//       .finally(() => {
//         if (currentRequest === requestId.current) setLoading(false);
//       });
//   }, [keyword, country, range, retryTick]);

//   const handleRetry = () => setRetryTick((t) => t + 1);

//   const handleExportCSV = () => {
//     const rows = [
//       ...data.top.map((i) => ['Top', i.query, i.formattedValue || i.value, getCachedExactCount(i.query, country) ?? '']),
//       ...data.rising.map((i) => ['Rising', i.query, i.formattedValue || i.value, getCachedExactCount(i.query, country) ?? '']),
//     ];
//     downloadCSV(
//       `related-queries-${keyword.replace(/\s+/g, '-')}`,
//       ['Type', 'Query', 'Change', 'Related Count'],
//       rows
//     );
//   };

//   const handleQueryClick = (word) => {
//     if (!word) return;
//     onSearchThis && onSearchThis(word);
//   };

//   if (!keyword) return null;

//   if (!loading && data.top.length === 0 && data.rising.length === 0 && !data.rateLimited) {
//     return (
//       <Stack
//         className="fade-in"
//         sx={{ bgcolor: '#fff', border: '1px solid #E4E8EE', borderRadius: 3, p: 3, textAlign: 'center' }}
//       >
//         <Typography variant="body2" sx={{ color: '#8B93A7' }}>
//           No related queries available for "{keyword}" in this time range. 
//         </Typography>
//       </Stack>
//     );
//   }

//   if (!loading && data.rateLimited) {
//     return (
//       <Stack
//         spacing={1}
//         alignItems="center"
//         className="fade-in"
//         sx={{ bgcolor: '#fff', border: '1px solid #E4E8EE', borderRadius: 3, p: 3, textAlign: 'center' }}
//       >
//         <Typography variant="body2" sx={{ color: '#8B93A7' }}>
//           Related queries temporarily unavailable — Google rate-limited this request. Please try again in a moment.
//         </Typography>
//         <Typography
//           variant="caption"
//           onClick={handleRetry}
//           sx={{ color: TOP_COLOR, cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
//         >
//           Retry now
//         </Typography>
//       </Stack>
//     );
//   }

//   return (
//     <Stack spacing={1.5} className="fade-in">
//       {!loading && (data.top.length > 0 || data.rising.length > 0) && (
//         <Stack direction="row" justifyContent="flex-end">
//           <Tooltip title="Download CSV">
//             <IconButton size="small" onClick={handleExportCSV} sx={{ color: '#6B7690', '&:hover': { color: TOP_COLOR } }}>
//               <DownloadIcon sx={{ fontSize: 18 }} />
//             </IconButton>
//           </Tooltip>
//         </Stack>
//       )}

//       <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
//         <QueryColumn
//           title="Top queries"
//           items={data.top}
//           loading={loading}
//           country={country}
//           activeWord={keyword}
//           onQueryClick={handleQueryClick}
//           accentColor={TOP_COLOR}
//         />
//         <QueryColumn
//           title="Rising queries"
//           items={data.rising}
//           loading={loading}
//           country={country}
//           activeWord={keyword}
//           onQueryClick={handleQueryClick}
//           accentColor={RISING_COLOR}
//         />
//       </Stack>
//     </Stack>
//   );
// }


import React, { useEffect, useRef, useState, useCallback, memo } from 'react'; // Added useCallback and memo for performance
import { Box, Stack, Typography, Skeleton, Chip, CircularProgress, IconButton, Tooltip } from '@mui/material';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import DownloadIcon from '@mui/icons-material/Download';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getRelatedQueries } from '../api/trends.api';
import { downloadCSV } from '../utils/csvExport';
import { useLazyExactCount, getCachedExactCount } from '../hooks/useExactCount';

// Project ke brand colors — Top = primary emerald, Rising = secondary blue
const TOP_COLOR = '#0E9F6E';
const RISING_COLOR = '#2c45a9';

function openInPlayStore(query, country) {
  const url = `https://play.google.com/store/search?q=${encodeURIComponent(query)}&c=apps${country ? `&gl=${country}` : ''}`;
  // Fix: Added noopener,noreferrer for security standard
  const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
  if (newWindow) newWindow.opener = null;
}

// Fix: Wrapped in React.memo to prevent 50+ unnecessary re-renders on every parent state change
const QueryRow = memo(function QueryRow({ item, idx, maxValue, country, isActive, onQueryClick, accentColor }) {
  const isBreakout = item.isBreakout;
  const pct = typeof item.value === 'number' && !isBreakout ? Math.round((item.value / maxValue) * 100) : 0;
  const isRisingPositive = typeof item.value === 'number' && item.value > 0;
  const { ref, count, loading } = useLazyExactCount(item.query, country);

  return (
    <Stack ref={ref} direction="row" alignItems="flex-start" spacing={{ xs: 0.75, sm: 1.5 }} sx={{ py: 0.25 }}>
      <Typography sx={{ width: { xs: 14, sm: 18 }, color: '#8B93A7', fontSize: { xs: '0.72rem', sm: '0.8rem' }, flexShrink: 0 }}>
        {idx + 1}
      </Typography>

      <Typography
        onClick={() => onQueryClick(item.query)}
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: { xs: '0.78rem', sm: '0.85rem' },
          color: isActive ? accentColor : '#0B1220',
          cursor: 'pointer',
          wordBreak: 'break-word',
          lineHeight: 1.3,
          '&:hover': { color: accentColor, textDecoration: 'underline' },
        }}
      >
        {item.query}
      </Typography>

      <Tooltip title="Open in Play Store">
        <IconButton
          size="small"
          onClick={() => openInPlayStore(item.query, country)}
          sx={{
            width: { xs: 20, sm: 22 },
            height: { xs: 20, sm: 22 },
            borderRadius: '6px',
            bgcolor: `${accentColor}1F`,
            color: accentColor,
            flexShrink: 0,
            '&:hover': { bgcolor: `${accentColor}33` },
          }}
        >
          <OpenInNewIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
        </IconButton>
      </Tooltip>

      <Box sx={{ flexShrink: 0, minWidth: { xs: 22, sm: 28 }, textAlign: 'right' }}>
        {loading ? (
          <CircularProgress size={11} thickness={6} sx={{ color: accentColor }} />
        ) : (
          <Typography
            sx={{
              fontSize: { xs: '0.65rem', sm: '0.72rem' },
              fontWeight: 700,
              color: count === undefined ? '#C4CAD6' : accentColor,
              fontFamily: `'JetBrains Mono', monospace`,
            }}
          >
            {count === undefined ? '…' : count}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: 60, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
        <Box sx={{ height: 6, borderRadius: 3, bgcolor: '#EEF1F5', overflow: 'hidden' }}>
          <Box
            sx={{
              height: '100%',
              width: `${isBreakout ? 15 : pct}%`,
              bgcolor: accentColor,
              borderRadius: 3,
            }}
          />
        </Box>
      </Box>

      <Box sx={{ flexShrink: 0, minWidth: { xs: 46, sm: 56 }, textAlign: 'right' }}>
        {isBreakout ? (
          <Chip
            label="Breakout"
            size="small"
            sx={{ bgcolor: accentColor, color: '#fff', fontWeight: 700, fontSize: { xs: '0.55rem', sm: '0.65rem' }, height: { xs: 16, sm: 20 } }}
          />
        ) : (
          <Stack direction="row" alignItems="center" spacing={0.25} justifyContent="flex-end">
            {isRisingPositive ? (
              <ArrowUpwardIcon sx={{ fontSize: { xs: 11, sm: 13 }, color: accentColor }} />
            ) : (
              <ArrowDownwardIcon sx={{ fontSize: { xs: 11, sm: 13 }, color: '#8B93A7' }} />
            )}
            <Typography sx={{ fontSize: { xs: '0.68rem', sm: '0.75rem' }, fontWeight: 600, color: isRisingPositive ? accentColor : '#8B93A7' }}>
              {item.formattedValue || item.value}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  );
});

// Fix: Wrapped in React.memo for UI performance
const QueryColumn = memo(function QueryColumn({ title, items, loading, country, activeWord, onQueryClick, accentColor }) {
  const maxValue = Math.max(...items.map((i) => (typeof i.value === 'number' ? i.value : 0)), 1);

  return (
    <Box
      sx={{
        bgcolor: '#fff',
        border: '1px solid #E4E8EE',
        borderTop: `3px solid ${accentColor}`,
        borderRadius: 3,
        p: { xs: 1.5, sm: 2.5 },
        flex: 1,
        minWidth: 0,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.25 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: accentColor, flexShrink: 0 }} />
        <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: '0.95rem', sm: '1rem' } }}>
          {title}
        </Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block' }}>
        Search interest
      </Typography>

      {loading && (
        <Stack spacing={1.5}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={32} variant="rounded" />
          ))}
        </Stack>
      )}

      {!loading && items.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No data available.
        </Typography>
      )}

      {!loading && items.length > 0 && (
        <Box
          sx={{
            maxHeight: 420,
            overflowY: 'auto',
            pr: 0.5,
            '&::-webkit-scrollbar': { width: 5 },
            '&::-webkit-scrollbar-thumb': { bgcolor: accentColor, borderRadius: 4 },
            '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
          }}
        >
          <Stack spacing={{ xs: 1, sm: 1.25 }}>
            {items.slice(0, 25).map((item, idx) => (
              <QueryRow
                key={item.query + idx}
                item={item}
                idx={idx}
                maxValue={maxValue}
                country={country}
                isActive={item.query === activeWord}
                onQueryClick={onQueryClick}
                accentColor={accentColor}
              />
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
});

export default function RelatedQueries({ keyword, country, range, onSearchThis }) {
  const [data, setData] = useState({ top: [], rising: [], rateLimited: false });
  const [loading, setLoading] = useState(false);
  const [retryTick, setRetryTick] = useState(0);
  const requestId = useRef(0);

  useEffect(() => {
    if (!keyword) return;
    const currentRequest = ++requestId.current;
    setLoading(true);

    // Range/country jaldi jaldi badalne par har intermediate value ke liye
    // alag Trends request na jaye - 350ms debounce, sirf aakhri value fetch
    // hoti hai. Isse related+interest bursts kam hote hain jo IP block
    // trigger karte the.
    const timer = setTimeout(() => {
      getRelatedQueries(keyword, country, range)
        .then((res) => {
          if (currentRequest !== requestId.current) return;

          // FIX (CRITICAL): Agar API object mein top/rising array return nahi hota toh app crash hojaati.
          // Ye line ensure karegi ke top aur rising hamesha arrays rahein, aur app na phatay.
          setData({
            top: res?.top || [],
            rising: res?.rising || [],
            rateLimited: res?.rateLimited || false
          });
        })
        .catch(() => {
          // FIX: Added rateLimited: false to safely reset the state on normal errors.
          if (currentRequest === requestId.current) setData({ top: [], rising: [], rateLimited: false });
        })
        .finally(() => {
          if (currentRequest === requestId.current) setLoading(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [keyword, country, range, retryTick]);

  const handleRetry = () => setRetryTick((t) => t + 1);

  const handleExportCSV = () => {
    const rows = [
      ...data.top.map((i) => ['Top', i.query, i.formattedValue || i.value, getCachedExactCount(i.query, country) ?? '']),
      ...data.rising.map((i) => ['Rising', i.query, i.formattedValue || i.value, getCachedExactCount(i.query, country) ?? '']),
    ];
    downloadCSV(
      `related-queries-${keyword.replace(/\s+/g, '-')}`,
      ['Type', 'Query', 'Change', 'Related Count'],
      rows
    );
  };

  // FIX: Wrapped in useCallback. Ye bar bar recreate nahi hoga jiski wajah se 50 items re-render hone se bach jayengy
  const handleQueryClick = useCallback((word) => {
    if (!word) return;
    onSearchThis && onSearchThis(word);
  }, [onSearchThis]);

  if (!keyword) return null;

  if (!loading && data.top.length === 0 && data.rising.length === 0 && !data.rateLimited) {
    return (
      <Stack
        className="fade-in"
        sx={{ bgcolor: '#fff', border: '1px solid #E4E8EE', borderRadius: 3, p: 3, textAlign: 'center' }}
      >
        <Typography variant="body2" sx={{ color: '#8B93A7' }}>
          No related queries available for "{keyword}" in this time range. 
        </Typography>
      </Stack>
    );
  }

  if (!loading && data.rateLimited) {
    return (
      <Stack
        spacing={1}
        alignItems="center"
        className="fade-in"
        sx={{ bgcolor: '#fff', border: '1px solid #E4E8EE', borderRadius: 3, p: 3, textAlign: 'center' }}
      >
        <Typography variant="body2" sx={{ color: '#8B93A7' }}>
          Related queries temporarily unavailable — Google rate-limited this request. Please try again in a moment.
        </Typography>
        <Typography
          variant="caption"
          onClick={handleRetry}
          sx={{ color: TOP_COLOR, cursor: 'pointer', fontWeight: 700, '&:hover': { textDecoration: 'underline' } }}
        >
          Retry now
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} className="fade-in">
      {!loading && (data.top.length > 0 || data.rising.length > 0) && (
        <Stack direction="row" justifyContent="flex-end">
          <Tooltip title="Download CSV">
            <IconButton size="small" onClick={handleExportCSV} sx={{ color: '#6B7690', '&:hover': { color: TOP_COLOR } }}>
              <DownloadIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
        <QueryColumn
          title="Top queries"
          items={data.top}
          loading={loading}
          country={country}
          activeWord={keyword}
          onQueryClick={handleQueryClick}
          accentColor={TOP_COLOR}
        />
        <QueryColumn
          title="Rising queries"
          items={data.rising}
          loading={loading}
          country={country}
          activeWord={keyword}
          onQueryClick={handleQueryClick}
          accentColor={RISING_COLOR}
        />
      </Stack>
    </Stack>
  );
}