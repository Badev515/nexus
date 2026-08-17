import { useEffect, useRef, useState } from 'react';
import { Box, Stack, Typography, Skeleton, InputBase, IconButton, Tooltip, CircularProgress, Snackbar } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getSuggestions } from '../api/playstore.api';
import { downloadCSV } from '../utils/csvExport';
import { useLazyExactCount, getCachedExactCount } from '../hooks/useExactCount';

const LETTERS = 'abcdefghijklmnopqrstuvwxyz'.split('');
const ACCENT = '#0E9F6E';
const ACCENT_DARK = '#0B7F58';
const INK = '#0B1220';

function WordRow({ word, country, isActive, onExpand, onCopy, onAddToCompare }) {
  const { ref, count, loading } = useLazyExactCount(word, country);

  const handleOpenPlayStore = (e) => {
    e.stopPropagation();
    const url = `https://play.google.com/store/search?q=${encodeURIComponent(word)}&c=apps${country ? `&gl=${country}` : ''}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Box
      ref={ref}
      onClick={() => onExpand(word)}
      sx={{
        px: 1.1,
        py: 0.85,
        borderRadius: 1.75,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 0.5,
        position: 'relative',
        bgcolor: isActive ? `${ACCENT}12` : 'transparent',
        boxShadow: isActive ? `inset 2px 0 0 ${ACCENT}` : 'inset 2px 0 0 transparent',
        transition: 'background-color 0.18s ease, box-shadow 0.18s ease',
        '&:hover': { bgcolor: isActive ? `${ACCENT}18` : '#F6F8FB' },
        '&:hover .copy-btn, &:hover .compare-btn': { opacity: 1 },
      }}
    >
      <Typography
        sx={{
          color: isActive ? ACCENT_DARK : INK,
          fontWeight: isActive ? 700 : 500,
          fontSize: '0.85rem',
          flex: 1,
          minWidth: 0,
          wordBreak: 'break-word',
          lineHeight: 1.35,
          letterSpacing: '-0.01em',
        }}
      >
        {word}
      </Typography>

      {onAddToCompare && (
        <Tooltip title="Add to compare">
          <IconButton
            className="compare-btn"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onAddToCompare(word);
            }}
            sx={{
              opacity: 0,
              transition: 'opacity 0.15s, transform 0.15s',
              p: 0.35,
              color: '#8B93A7',
              '&:hover': { color: ACCENT, transform: 'scale(1.12)' },
              flexShrink: 0,
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      )}

      <IconButton
        className="copy-btn"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          onCopy(e, word);
        }}
        sx={{
          opacity: 0,
          transition: 'opacity 0.15s, transform 0.15s',
          p: 0.35,
          color: '#8B93A7',
          '&:hover': { color: ACCENT, transform: 'scale(1.12)' },
          flexShrink: 0,
        }}
      >
        <ContentCopyIcon sx={{ fontSize: 13 }} />
      </IconButton>

      <Box
        sx={{
          minWidth: 30,
          textAlign: 'right',
          flexShrink: 0,
          bgcolor: count === undefined ? 'transparent' : `${ACCENT}0F`,
          borderRadius: 1,
          px: count === undefined ? 0 : 0.6,
          py: 0.15,
        }}
      >
        {loading ? (
          <CircularProgress size={11} thickness={6} sx={{ color: ACCENT }} />
        ) : (
          <Typography
            sx={{
              fontSize: '0.72rem',
              color: count === undefined ? '#C4CAD6' : ACCENT_DARK,
              fontFamily: `'JetBrains Mono', monospace`,
              fontWeight: 700,
            }}
          >
            {count === undefined ? '…' : count}
          </Typography>
        )}
      </Box>

      <Tooltip title="Open in Play Store">
        <IconButton
          className="open-btn"
          size="small"
          onClick={handleOpenPlayStore}
          sx={{
            p: 0.35,
            color: ACCENT,
            flexShrink: 0,
            transition: 'transform 0.15s, background-color 0.15s',
            '&:hover': { bgcolor: `${ACCENT}14`, transform: 'scale(1.12)' },
          }}
        >
          <OpenInNewIcon sx={{ fontSize: 13 }} />
        </IconButton>
      </Tooltip>
    </Box>
  );
}

export default function RelatedWordsGrid({
  keyword,
  country,
  geo,
  range,
  onSearchThis,
  onClose,
  onStats,
  onActiveWordChange,
  onAddToCompare,
  level = 0,
}) {
  const [grouped, setGrouped] = useState({});
  const [loading, setLoading] = useState(false);
  const [childWord, setChildWord] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [copiedMsg, setCopiedMsg] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const requestId = useRef(0);
  const childRef = useRef(null);

  useEffect(() => {
    if (!keyword) { setGrouped({}); return; }
    const currentRequest = ++requestId.current;
    setLoading(true);
    setGrouped({});
    setChildWord('');
    setInputValue('');

    const CONCURRENCY = 6;

    const runConcurrent = async () => {
      let idx = 0;
      const collected = {};

      async function worker() {
        while (idx < LETTERS.length) {
          const letter = LETTERS[idx++];
          if (currentRequest !== requestId.current) return;
          try {
            const data = await getSuggestions(`${keyword} ${letter}`, country);
            if (currentRequest !== requestId.current) return;
            if (Array.isArray(data) && data.length) {
              collected[letter] = data;
              setGrouped((prev) => ({ ...prev, [letter]: data }));
            }
          } catch {
            // ignore
          }
        }
      }

      await Promise.all(Array.from({ length: CONCURRENCY }, worker));

      if (currentRequest === requestId.current) {
        setLoading(false);
        if (level === 0 && onStats) {
          const total = Object.values(collected).reduce((sum, arr) => sum + arr.length, 0);
          onStats(total);
        }
      }
    };

    runConcurrent();
  }, [keyword, country]);

  useEffect(() => {
    if (childWord && childRef.current) {
      const timer = setTimeout(() => {
        childRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [childWord]);

  if (!keyword) return null;

  const handleExpand = (word) => {
    const trimmed = word.trim();
    if (!trimmed) return;
    const next = childWord === trimmed ? '' : trimmed;
    setChildWord(next);
    onActiveWordChange && onActiveWordChange(next || keyword);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleExpand(inputValue);
    }
  };

  const handleCloseChild = () => {
    setChildWord('');
    onActiveWordChange && onActiveWordChange(keyword);
  };

  const handleCopy = (e, word) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(word).then(() => {
      setCopiedMsg(`"${word}" copied`);
    });
  };

  const totalCount = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
  const activeLetters = LETTERS.filter((l) => grouped[l]);

  const handleExportCSV = () => {
    const rows = [];
    activeLetters.forEach((letter) => {
      grouped[letter].forEach((word) => {
        rows.push([letter.toUpperCase(), word, getCachedExactCount(word, country) ?? '']);
      });
    });
    downloadCSV(
      `related-words-${keyword.replace(/\s+/g, '-')}`,
      ['Letter', 'Keyword', 'Related Count'],
      rows
    );
  };

  return (
    <Stack spacing={2.25} className="fade-in">
      <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
        <Box
          sx={{
            background: `linear-gradient(135deg, ${INK} 0%, #1B2740 100%)`,
            color: ACCENT,
            px: 1.4,
            py: 0.5,
            borderRadius: 1.25,
            fontFamily: `'JetBrains Mono', monospace`,
            fontWeight: 700,
            fontSize: '0.72rem',
            letterSpacing: '0.04em',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(11,18,32,0.25)',
          }}
        >
          {level === 0 ? '1ST GRID' : level === 1 ? '2ND GRID' : `${level + 1}TH GRID`}
        </Box>
        <Typography variant="subtitle1" noWrap sx={{ color: INK, fontWeight: 700, letterSpacing: '-0.01em' }}>
          {level === 0 ? 'Keyword Index' : `Related to "${keyword}"`}
        </Typography>
        {!loading && (
          <Box
            sx={{
              bgcolor: `${ACCENT}14`,
              color: ACCENT_DARK,
              px: 1,
              py: 0.25,
              borderRadius: 5,
              fontSize: '0.7rem',
              fontWeight: 700,
              fontFamily: `'JetBrains Mono', monospace`,
            }}
          >
            {totalCount} keywords
          </Box>
        )}

        <Stack direction="row" spacing={0.5} sx={{ ml: 'auto' }}>
          {!loading && totalCount > 0 && (
            <Tooltip title="Download CSV">
              <IconButton
                size="small"
                onClick={handleExportCSV}
                sx={{
                  color: '#6B7690',
                  transition: 'transform 0.15s, background-color 0.15s',
                  '&:hover': { color: ACCENT, bgcolor: `${ACCENT}14`, transform: 'translateY(-1px)' },
                }}
              >
                <DownloadIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}

          {onClose && (
            <Tooltip title="Close grid">
              <IconButton
                size="small"
                onClick={onClose}
                sx={{
                  color: '#6B7690',
                  transition: 'transform 0.15s, background-color 0.15s',
                  '&:hover': { color: '#D64545', bgcolor: 'rgba(214,69,69,0.08)', transform: 'translateY(-1px)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{
          bgcolor: '#fff',
          border: `1.5px solid ${inputFocused ? ACCENT : '#E4E8EE'}`,
          borderRadius: 2.5,
          px: 1.75,
          py: 0.9,
          maxWidth: 420,
          transition: 'border-color 0.18s ease, box-shadow 0.18s ease',
          boxShadow: inputFocused ? `0 0 0 4px ${ACCENT}14` : '0 1px 2px rgba(11,18,32,0.03)',
        }}
      >
        <SearchIcon sx={{ fontSize: 18, color: inputFocused ? ACCENT : '#8B93A7', transition: 'color 0.18s' }} />
        <InputBase
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleInputKeyDown}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
          placeholder="Type a word and press Enter..."
          sx={{ flex: 1, color: INK, fontSize: '0.85rem', '& input::placeholder': { color: '#8B93A7', opacity: 1 } }}
        />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr' }, gap: 1.75 }}>
        {loading &&
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={260} sx={{ borderRadius: 3 }} />
          ))}

        {!loading &&
          activeLetters.map((letter) => {
            const words = grouped[letter];
            return (
              <Box
                key={letter}
                sx={{
                  bgcolor: '#fff',
                  border: '1px solid #E4E8EE',
                  borderRadius: 3,
                  p: 1.75,
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                  boxShadow: '0 1px 3px rgba(11,18,32,0.05), 0 1px 2px rgba(11,18,32,0.03)',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  '&:hover': {
                    boxShadow: '0 8px 24px rgba(11,18,32,0.09)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, px: 0.25 }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: `linear-gradient(135deg, ${ACCENT} 0%, ${ACCENT_DARK} 100%)`,
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      fontFamily: `'JetBrains Mono', monospace`,
                      boxShadow: `0 2px 6px ${ACCENT}55`,
                      flexShrink: 0,
                    }}
                  >
                    {letter.toUpperCase()}
                  </Box>
                  <Typography sx={{ color: '#8B93A7', fontSize: '0.78rem', fontWeight: 600 }}>
                    {words.length} words
                  </Typography>

                  {level > 0 && (
                    words.length < 5 ? (
                      <Tooltip title="Fewer than 5 keywords">
                        <Box
                          sx={{
                            ml: 'auto',
                            width: 9,
                            height: 9,
                            borderRadius: '50%',
                            bgcolor: '#D64545',
                            boxShadow: '0 0 0 3px rgba(214,69,69,0.15)',
                            flexShrink: 0,
                          }}
                        />
                      </Tooltip>
                    ) : (
                      <Typography
                        sx={{
                          ml: 'auto',
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          color: ACCENT_DARK,
                          bgcolor: `${ACCENT}14`,
                          px: 0.9,
                          py: 0.15,
                          borderRadius: 5,
                          letterSpacing: '0.02em',
                        }}
                      >
                        pass
                      </Typography>
                    )
                  )}
                </Stack>

                <Box
                  sx={{
                    maxHeight: 300,
                    overflowY: 'auto',
                    pr: 0.5,
                    '&::-webkit-scrollbar': { width: 5 },
                    '&::-webkit-scrollbar-thumb': { bgcolor: `${ACCENT}88`, borderRadius: 4 },
                    '&::-webkit-scrollbar-thumb:hover': { bgcolor: ACCENT },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                  }}
                >
                  <Stack spacing={0.25} divider={<Box sx={{ borderBottom: '1px solid #F0F3F7' }} />}>
                    {words.map((w, idx) => (
                      <WordRow
                        key={idx}
                        word={w}
                        country={country}
                        isActive={w === childWord}
                        onExpand={handleExpand}
                        onCopy={handleCopy}
                        onAddToCompare={onAddToCompare}
                      />
                    ))}
                  </Stack>
                </Box>
              </Box>
            );
          })}
      </Box>

      {childWord && (
        <Box
          ref={childRef}
          className="fade-in"
          sx={{
            pl: { xs: 1.5, sm: 3 },
            borderLeft: `2px solid ${ACCENT}44`,
            ml: { xs: 0.5, sm: 1 },
            scrollMarginTop: '80px',
          }}
        >
          <RelatedWordsGrid
            keyword={childWord}
            country={country}
            geo={geo}
            range={range}
            onSearchThis={onSearchThis}
            onClose={handleCloseChild}
            onActiveWordChange={onActiveWordChange}
            onAddToCompare={onAddToCompare}
            level={level + 1}
          />
        </Box>
      )}

      <Snackbar
        open={!!copiedMsg}
        autoHideDuration={1500}
        onClose={() => setCopiedMsg('')}
        message={copiedMsg}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Stack>
  );
}
