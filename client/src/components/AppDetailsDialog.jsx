import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Stack,
  Skeleton,
  Rating,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { getAppDetails } from '../api/playstore.api';

export default function AppDetailsDialog({ open, appId, country, onClose }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descExpanded, setDescExpanded] = useState(false);

  // Sirf jab dialog khule aur pehle load na hui ho, tabhi fetch hota hai (on-demand, koi background load nahi)
  useEffect(() => {
    if (!open || !appId) return;
    let cancelled = false;
    setLoading(true);
    setError('');
    setDescExpanded(false);

    getAppDetails(appId, country)
      .then((data) => {
        if (cancelled) return;
        if (data) setDetails(data);
        else setError('Details not available for this app.');
      })
      .catch(() => {
        if (!cancelled) setError('Failed to load app details.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [open, appId, country]);

  const handleClose = () => {
    onClose();
    // Dialog band hone ke thodi der baad state clear karein (close animation smooth rahe)
    setTimeout(() => setDetails(null), 200);
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <IconButton
        onClick={handleClose}
        sx={{ position: 'absolute', right: 8, top: 8, zIndex: 1, bgcolor: 'rgba(0,0,0,0.05)' }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ pt: 4 }}>
        {loading && (
          <Stack spacing={2}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Skeleton variant="rounded" width={72} height={72} />
              <Stack spacing={1} flex={1}>
                <Skeleton width="70%" height={28} />
                <Skeleton width="40%" height={18} />
              </Stack>
            </Stack>
            <Skeleton variant="rounded" height={140} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <Skeleton width="60%" height={20} />
          </Stack>
        )}

        {!loading && error && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            {error}
          </Typography>
        )}

        {!loading && !error && details && (
          <Stack spacing={2.5}>
            {/* Header */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                component="img"
                src={details.icon}
                alt={details.title}
                loading="lazy"
                sx={{ width: 72, height: 72, borderRadius: 2, flexShrink: 0 }}
              />
              <Stack spacing={0.5} minWidth={0}>
                <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
                  {details.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {details.developer}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Rating value={details.score || 0} precision={0.1} readOnly size="small" />
                  <Typography variant="caption" color="text.secondary">
                    {details.score ? details.score.toFixed(1) : '—'} ({details.ratings?.toLocaleString?.() || 0})
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            {/* Screenshots - lazy loaded images, horizontal scroll */}
            {details.screenshots?.length > 0 && (
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  pb: 1,
                  '&::-webkit-scrollbar': { height: 6 },
                  '&::-webkit-scrollbar-thumb': { bgcolor: '#D6DBE3', borderRadius: 4 },
                }}
              >
                {details.screenshots.map((src, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={src}
                    alt={`Screenshot ${idx + 1}`}
                    loading="lazy"
                    sx={{
                      height: 220,
                      borderRadius: 2,
                      flexShrink: 0,
                      border: '1px solid #E4E8EE',
                    }}
                  />
                ))}
              </Box>
            )}

            {/* Quick stats */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {details.installs && <Chip size="small" label={`${details.installs} installs`} />}
              {details.genre && <Chip size="small" label={details.genre} />}
              {details.free !== undefined && (
                <Chip size="small" label={details.free ? 'Free' : details.price} />
              )}
              {details.version && <Chip size="small" label={`v${details.version}`} />}
            </Stack>

            <Divider />

            {/* Description */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                About this app
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: 'pre-line',
                  display: '-webkit-box',
                  WebkitLineClamp: descExpanded ? 'unset' : 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {details.description}
              </Typography>
              {details.description && details.description.length > 200 && (
                <Button size="small" onClick={() => setDescExpanded((v) => !v)} sx={{ mt: 0.5, px: 0 }}>
                  {descExpanded ? 'Show less' : 'Show more'}
                </Button>
              )}
            </Box>

            <Divider />

            {/* Additional info */}
            <Stack spacing={1}>
              {details.released && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Released</Typography>
                  <Typography variant="body2">{details.released}</Typography>
                </Stack>
              )}
              {details.updated && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Updated</Typography>
                  <Typography variant="body2">{details.updated}</Typography>
                </Stack>
              )}
              {details.developerWebsite && (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Developer website</Typography>
                  <Typography
                    component="a"
                    href={details.developerWebsite}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="body2"
                    sx={{ color: '#0E9F6E', textDecoration: 'none' }}
                  >
                    Visit
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Button
              variant="contained"
              endIcon={<OpenInNewIcon />}
              href={details.url}
              target="_blank"
              rel="noopener noreferrer"
              disableElevation
              sx={{ bgcolor: '#0E9F6E', '&:hover': { bgcolor: '#0B7A54' } }}
            >
              Open in Play Store
            </Button>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}