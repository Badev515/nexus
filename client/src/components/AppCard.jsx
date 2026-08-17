import { useState } from 'react';
import { Card, CardMedia, CardContent, Typography, Button, Rating, Stack, Chip, Skeleton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AppDetailsDialog from './AppDetailsDialog';

export default function AppCard({ app, country, countryLabel, loading }) {
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (loading) {
    return (
      <Card sx={{ borderRadius: 3, p: 2.5 }} elevation={0}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Skeleton variant="rounded" width={64} height={64} />
          <Stack spacing={1} flex={1}>
            <Skeleton width="50%" height={26} />
            <Skeleton width="30%" height={18} />
          </Stack>
        </Stack>
      </Card>
    );
  }

  if (!app) return null;
  const storeUrl = country ? `${app.url}&gl=${country}` : app.url;

  return (
    <>
      <Card sx={{ borderRadius: 3, p: 2.5, '&:hover': { borderColor: '#0E9F6E' } }} elevation={0}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5} alignItems="center">
          <CardMedia
            component="img"
            image={app.icon}
            alt={app.title}
            loading="lazy"
            onClick={() => setDetailsOpen(true)}
            sx={{ width: 64, height: 64, borderRadius: 2, flexShrink: 0, cursor: 'pointer' }}
          />
          <CardContent
            onClick={() => setDetailsOpen(true)}
            sx={{
              flex: 1,
              minWidth: 0,
              p: 0,
              '&:last-child': { pb: 0 },
              textAlign: { xs: 'center', sm: 'left' },
              cursor: 'pointer',
            }}
          >
            <Typography variant="h6" noWrap sx={{ fontSize: '1.05rem' }}>{app.title}</Typography>
            <Typography variant="body2" color="text.secondary" noWrap>{app.developer}</Typography>
            <Stack direction="row" spacing={1} alignItems="center" mt={0.75} justifyContent={{ xs: 'center', sm: 'flex-start' }} flexWrap="wrap">
              <Rating value={app.score || 0} precision={0.1} readOnly size="small" />
              {countryLabel && (
                <Chip label={countryLabel.toUpperCase()} size="small" sx={{ bgcolor: '#EAF7F1', color: '#0B7A54', fontWeight: 600 }} />
              )}
            </Stack>
          </CardContent>
          <Button
            variant="contained"
            disableElevation
            endIcon={<OpenInNewIcon />}
            href={storeUrl}
            target="_blank"
            rel="noopener noreferrer"
            sx={{ whiteSpace: 'nowrap', flexShrink: 0, bgcolor: '#0E9F6E', '&:hover': { bgcolor: '#0B7A54' } }}
          >
            Open in Play Store
          </Button>
        </Stack>
      </Card>

      <AppDetailsDialog
        open={detailsOpen}
        appId={app.appId}
        country={country}
        onClose={() => setDetailsOpen(false)}
      />
    </>
  );
}