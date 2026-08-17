import { useState, useRef, useEffect } from 'react';
import { Container, Stack, Typography, Alert, Box, Divider, Chip } from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import SearchBar from '../components/SearchBar';
import CountrySelect, { WORLDWIDE } from '../components/CountrySelect';
import AppCard from '../components/AppCard';
import TrendChart from '../components/TrendChart';
import RelatedQueries from '../components/RelatedQueries';
import RelatedWordsGrid from '../components/RelatedWordsGrid';
import StatsSummary from '../components/StatsSummary';
import CompareView from '../components/CompareView';
import { searchApps } from '../api/playstore.api';
import { getTrend } from '../api/trends.api';
import {
  getSearchHistory,
  addToSearchHistory,
  removeFromSearchHistory,
  clearSearchHistory,
} from '../utils/searchHistory';

const ACCENT = '#0E9F6E';

// Brand mark — icon + "NEXUS" wordmark
function BrandLogo() {
  return (
    <Stack direction="row" alignItems="center" spacing={1.1} sx={{ mb: 3 }}>
      <Box
        sx={{
          width: 34,
          height: 34,
          borderRadius: '9px',
          background: `linear-gradient(135deg, ${ACCENT} 0%, #0B7F58 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 14px ${ACCENT}55`,
          flexShrink: 0,
        }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M4 17L9 9L14 13L20 5" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="20" cy="5" r="2.2" fill="#fff" />
        </svg>
      </Box>
      <Typography
        sx={{
          fontFamily: `'JetBrains Mono', monospace`,
          fontWeight: 800,
          fontSize: '1.05rem',
          letterSpacing: '0.06em',
          color: '#fff',
        }}
      >
        NEXUS
      </Typography>
    </Stack>
  );
}

// Decorative hero illustration — abstract "app intelligence" motif (search + rising trend + app cards)
// Pure inline SVG, no external assets, desktop-only.
function HeroIllustration() {
  return (
    <Box
      aria-hidden="true"
      sx={{
        display: 'block',
        position: 'absolute',
        top: { xs: 4, sm: 10, lg: 10 },
        right: { xs: -30, sm: -10, lg: 30 },
        width: { xs: 170, sm: 230, lg: 300 },
        height: { xs: 170, sm: 230, lg: 300 },
        opacity: { xs: 0.32, sm: 0.55, lg: 1 },
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <svg width="100%" height="100%" viewBox="0 0 340 340" fill="none">
        {/* orbit ring */}
        <circle cx="170" cy="170" r="150" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" strokeDasharray="3 7" />
        <circle cx="170" cy="170" r="110" stroke="rgba(14,159,110,0.15)" strokeWidth="1.5" />

        {/* floating app card (back) */}
        <g transform="rotate(-8 170 170)">
          <rect x="60" y="110" width="150" height="96" rx="14" fill="#14213D" stroke="rgba(255,255,255,0.08)" />
          <circle cx="84" cy="136" r="10" fill="rgba(255,255,255,0.12)" />
          <rect x="102" y="129" width="70" height="7" rx="3.5" fill="rgba(255,255,255,0.14)" />
          <rect x="102" y="141" width="46" height="6" rx="3" fill="rgba(255,255,255,0.08)" />
          <rect x="76" y="164" width="18" height="24" rx="3" fill={`${ACCENT}33`} />
          <rect x="100" y="150" width="18" height="38" rx="3" fill={`${ACCENT}55`} />
          <rect x="124" y="172" width="18" height="16" rx="3" fill={`${ACCENT}33`} />
          <rect x="148" y="158" width="18" height="30" rx="3" fill={ACCENT} />
        </g>

        {/* front card: trend line */}
        <g transform="rotate(6 170 170)">
          <rect x="118" y="150" width="168" height="106" rx="16" fill="#FFFFFF" />
          <rect x="118" y="150" width="168" height="106" rx="16" fill="url(#cardGrad)" opacity="0.06" />
          <circle cx="142" cy="174" r="4" fill={ACCENT} />
          <rect x="154" y="170" width="64" height="7" rx="3.5" fill="#0B1220" opacity="0.75" />
          <rect x="154" y="181" width="40" height="5" rx="2.5" fill="#0B1220" opacity="0.3" />

          <path
            d="M136 232 L160 214 L182 226 L210 196 L238 208 L262 182"
            stroke={ACCENT}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <circle cx="262" cy="182" r="5" fill={ACCENT} />
          <circle cx="262" cy="182" r="9" stroke={ACCENT} strokeWidth="1.5" opacity="0.4" />
        </g>

        {/* magnifier badge */}
        <g transform="translate(70 230)">
          <circle cx="18" cy="18" r="18" fill="#0B1220" stroke="rgba(255,255,255,0.1)" />
          <circle cx="15" cy="15" r="6" stroke="#fff" strokeWidth="2" fill="none" />
          <line x1="19.5" y1="19.5" x2="24" y2="24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>

        {/* floating dots */}
        <circle cx="60" cy="70" r="3" fill={ACCENT} opacity="0.6" />
        <circle cx="285" cy="90" r="4" fill="rgba(255,255,255,0.25)" />
        <circle cx="295" cy="250" r="3" fill={ACCENT} opacity="0.5" />

        <defs>
          <linearGradient id="cardGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={ACCENT} />
            <stop offset="100%" stopColor="#14213D" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
}

export default function Home() {
  const [country, setCountry] = useState(WORLDWIDE);
  const [selectedApp, setSelectedApp] = useState(null);
  const [range, setRange] = useState('7d');
  const [keyword, setKeyword] = useState('');
  const [activeWord, setActiveWord] = useState('');
  const [compareKeywords, setCompareKeywords] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [trendLoading, setTrendLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [relatedWordsCount, setRelatedWordsCount] = useState(null);
  const requestId = useRef(0);
  const trendRequestId = useRef(0);
  const isFirstRun = useRef(true);

  const playCountry = country.alpha2Code ? country.alpha2Code.toLowerCase() : 'us';
  const geo = country.alpha2Code ? country.alpha2Code.toUpperCase() : '';

  useEffect(() => {
    setHistory(getSearchHistory());
  }, []);

  const fetchApp = async (term, playCountryOverride, currentRequest) => {
    try {
      const apps = await searchApps(term, playCountryOverride);
      if (currentRequest !== requestId.current) return;
      if (apps && apps.length) setSelectedApp(apps[0]);
      else setError('No app found.');
    } catch {
      if (currentRequest === requestId.current) setError('App search failed.');
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  const fetchTrend = async (term, geoOverride, rangeOverride) => {
    const currentRequest = ++trendRequestId.current;
    setTrendLoading(true);
    try {
      const trend = await getTrend(term, geoOverride, rangeOverride);
      if (currentRequest !== trendRequestId.current) return;
      const newData = trend?.default?.timelineData || [];
      if (newData.length > 0) {
        setTrendData(newData);
      }
    } catch {
      // Error par purana data mitayen nahi
    } finally {
      if (currentRequest === trendRequestId.current) setTrendLoading(false);
    }
  };

  // FIX #5: options param add kiya - fromHistory=false hone par search history
  // update nahi hoti (jaise country-change wale auto re-search ke liye).
  const runSearch = (term, playCountryOverride, options = {}) => {
    const { fromHistory = true } = options;
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError('');
    setSelectedApp(null);
    setKeyword(term);
    setActiveWord(term);
    setRelatedWordsCount(null);
    setTrendData([]);

    if (fromHistory) setHistory(addToSearchHistory(term));
    fetchApp(term, playCountryOverride, currentRequest);
    fetchTrend(term, geo, range);
  };

  const handleSearch = (term) => runSearch(term, playCountry);

  const handleActiveWordChange = (word) => {
    if (!word) return;
    setActiveWord(word);
    setTrendData([]);
    fetchTrend(word, geo, range);
  };

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    if (activeWord) fetchTrend(activeWord, geo, newRange);
  };

  const handleAddToCompare = (word) => {
    setCompareKeywords((prev) => {
      if (prev.includes(word) || prev.length >= 3) return prev;
      return [...prev, word];
    });
  };

  // FIX #5: country change par auto re-search history mein add nahi hota
  useEffect(() => {
    if (isFirstRun.current) { isFirstRun.current = false; return; }
    if (!keyword) return;
    const timer = setTimeout(() => runSearch(keyword, playCountry, { fromHistory: false }), 50);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#EEF4F1',
        backgroundImage: `
          radial-gradient(750px circle at 5% 0%, rgba(14,159,110,0.16), transparent 55%),
          radial-gradient(650px circle at 100% 10%, rgba(20,33,61,0.10), transparent 55%),
          radial-gradient(600px circle at 50% 100%, rgba(14,159,110,0.10), transparent 60%),
          radial-gradient(rgba(11,18,32,0.06) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, auto, auto, 22px 22px',
        backgroundPosition: '0 0, 0 0, 0 0, 0 0',
        backgroundRepeat: 'no-repeat, no-repeat, no-repeat, repeat',
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          background: 'linear-gradient(180deg, #0B1220 0%, #14213D 100%)',
          color: '#fff',
          pt: { xs: 5, sm: 7 },
          pb: { xs: 6, sm: 8 },
          px: 2,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Premium mesh-gradient glow layer */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            background: `
              radial-gradient(650px circle at 12% 15%, rgba(14,159,110,0.30), transparent 60%),
              radial-gradient(550px circle at 88% 15%, rgba(56,120,255,0.16), transparent 60%),
              radial-gradient(500px circle at 50% 100%, rgba(14,159,110,0.14), transparent 65%)
            `,
          }}
        />

        {/* Subtle grid pattern */}
        <Box
          aria-hidden="true"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            opacity: 0.05,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.9) 1px, transparent 1px)',
            backgroundSize: '44px 44px',
            maskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 85%)',
            WebkitMaskImage: 'linear-gradient(180deg, rgba(0,0,0,0.9), transparent 85%)',
          }}
        />

        <HeroIllustration />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <BrandLogo />

          <Typography variant="overline" sx={{ color: '#0E9F6E', fontFamily: `'JetBrains Mono', monospace`, letterSpacing: 2 }}>
            APP INTELLIGENCE
          </Typography>
          <Typography variant="h4" sx={{ mt: 1, mb: 1.5, fontSize: { xs: '1.9rem', sm: '2.5rem' } }}>
            Know what the world is searching for
          </Typography>
          <Typography variant="body1" sx={{ color: '#AEB8C7', mb: 4, maxWidth: 520 }}>
            Real Play Store suggestions, live trend data, and keyword discovery — for any country, in real time.
          </Typography>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1.5}
            sx={{
              bgcolor: '#fff',
              p: 1.25,
              borderRadius: 3,
              boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
              maxWidth: 640,
              position: 'relative',
              zIndex: 2,
            }}
          >
            <Box sx={{ flex: { sm: '0 0 200px' } }}>
              <CountrySelect value={country} onChange={setCountry} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <SearchBar country={playCountry} onSearch={handleSearch} />
            </Box>
          </Stack>

          {history.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ mt: 2 }} flexWrap="wrap" useFlexGap alignItems="center">
              <HistoryIcon sx={{ fontSize: 16, color: '#8A94A3' }} />
              {history.map((term) => (
                <Chip
                  key={term}
                  label={term}
                  size="small"
                  onClick={() => handleSearch(term)}
                  onDelete={() => setHistory(removeFromSearchHistory(term))}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.08)',
                    color: '#DCE1EA',
                    fontSize: '0.75rem',
                    '&:hover': { bgcolor: 'rgba(14,159,110,0.2)', color: '#0E9F6E' },
                    '& .MuiChip-deleteIcon': { color: '#8A94A3', fontSize: 16 },
                    '& .MuiChip-deleteIcon:hover': { color: '#fff' },
                  }}
                />
              ))}
              <Typography
                variant="caption"
                onClick={() => setHistory(clearSearchHistory())}
                sx={{ color: '#8A94A3', cursor: 'pointer', ml: 1, '&:hover': { color: '#fff', textDecoration: 'underline' } }}
              >
                Clear all
              </Typography>
            </Stack>
          )}
        </Container>
      </Box>

      {/* Results */}
      <Container maxWidth="md" sx={{ py: { xs: 3, sm: 5 }, px: { xs: 2, sm: 3 } }}>
        <Stack spacing={3}>
          {error && <Alert severity="warning">{error}</Alert>}

          {(selectedApp || loading) && (
            <Box className="fade-in">
              <StatsSummary app={selectedApp} relatedWordsCount={relatedWordsCount} loading={loading} />
            </Box>
          )}

          {(selectedApp || loading) && (
            <Box className="fade-in">
              <AppCard app={selectedApp} country={playCountry} countryLabel={country.name} loading={loading} />
            </Box>
          )}

          {(activeWord && (trendData.length > 0 || trendLoading)) && (
            <Box className="fade-in">
              <TrendChart
                data={trendData}
                keyword={activeWord}
                loading={trendLoading}
                range={range}
                onRangeChange={handleRangeChange}
              />
            </Box>
          )}

          {activeWord && (
            <Box className="fade-in">
              <RelatedQueries
                keyword={activeWord}
                country={geo}
                range={range}
                onSearchThis={handleActiveWordChange}
              />
            </Box>
          )}

          <Divider />
          <CompareView
            keywords={compareKeywords}
            onChange={setCompareKeywords}
            country={playCountry}
            geo={geo}
            range={range}
          />

          {keyword && (
            <>
              <Divider />
              <RelatedWordsGrid
                keyword={keyword}
                country={playCountry}
                geo={geo}
                range={range}
                onSearchThis={handleSearch}
                onStats={setRelatedWordsCount}
                onClose={() => {
                  // FIX #4: pehle sirf keyword/activeWord/trendData clear hote
                  // the - ab selectedApp, error, relatedWordsCount bhi clear
                  // hote hain, taake UI poori tarah reset ho.
                  setKeyword('');
                  setActiveWord('');
                  setTrendData([]);
                  setSelectedApp(null);
                  setError('');
                  setRelatedWordsCount(null);
                }}
                onActiveWordChange={handleActiveWordChange}
                onAddToCompare={handleAddToCompare}
              />
            </>
          )}
        </Stack>
      </Container>

      <Box component="footer" sx={{ borderTop: '1px solid #E4E8EE', py: 3, mt: 4 }}>
        <Container maxWidth="md">
          <Typography variant="caption" color="text.secondary" fontFamily="'JetBrains Mono', monospace">
            NEXUS — powered by Play Store & Google Trends data
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
