import { useState } from 'react';
import { Stack, TextField, Button, Chip, Box, Typography } from '@mui/material';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

const MAX_COMPARE = 3;
const COLORS = ['#4285F4', '#EA4335', '#0E9F6E'];

export default function CompareBar({ keywords, onChange }) {
  const [input, setInput] = useState('');

  const addKeyword = () => {
    const trimmed = input.trim();
    if (!trimmed || keywords.length >= MAX_COMPARE) return;
    if (keywords.some((k) => k.toLowerCase() === trimmed.toLowerCase())) return;
    onChange([...keywords, trimmed]);
    setInput('');
  };

  const removeKeyword = (kw) => {
    onChange(keywords.filter((k) => k !== kw));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addKeyword();
    }
  };

  return (
    <Box sx={{ bgcolor: '#fff', border: '1px solid #E4E8EE', borderRadius: 3, p: 2.5 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
        <CompareArrowsIcon sx={{ color: '#0E9F6E', fontSize: 20 }} />
        <Typography variant="subtitle1">Compare Keywords</Typography>
        <Typography variant="caption" color="text.secondary">({keywords.length}/{MAX_COMPARE})</Typography>
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: keywords.length ? 1.5 : 0 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Type a keyword and press Enter..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={keywords.length >= MAX_COMPARE}
        />
        <Button
          variant="contained"
          disableElevation
          onClick={addKeyword}
          disabled={!input.trim() || keywords.length >= MAX_COMPARE}
          sx={{ bgcolor: '#0E9F6E', whiteSpace: 'nowrap', '&:hover': { bgcolor: '#0B7A54' } }}
        >
          Add
        </Button>
      </Stack>

      {keywords.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {keywords.map((kw, idx) => (
            <Chip
              key={kw}
              label={kw}
              onDelete={() => removeKeyword(kw)}
              sx={{
                bgcolor: `${COLORS[idx]}18`,
                color: COLORS[idx],
                fontWeight: 600,
                '& .MuiChip-deleteIcon': { color: COLORS[idx] },
              }}
            />
          ))}
        </Stack>
      )}

      {keywords.length < 2 && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5 }}>
          two or more keywords are required for comparison. Add more keywords to see the comparison chart.
        </Typography>
      )}
    </Box>
  );
}