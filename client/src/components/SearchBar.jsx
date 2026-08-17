

import { useRef, useState } from 'react';
import { Autocomplete, TextField, Button, Stack } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { getSuggestions } from '../api/playstore.api';

export default function SearchBar({ country, onSearch }) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const debounceRef = useRef(null);

  const handleInputChange = (e, value) => {
    setInputValue(value);
    clearTimeout(debounceRef.current);
    if (!value) {
      setOptions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await getSuggestions(value, country);
        setOptions(data || []);
      } catch {
        setOptions([]);
      }
    }, 300);
  };

  const triggerSearch = () => {
    const trimmed = inputValue.trim();
    if (trimmed) onSearch(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      triggerSearch();
    }
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} width="100%">
      <Autocomplete
        freeSolo
        fullWidth
        options={options}
        inputValue={inputValue}
        onInputChange={handleInputChange}
        onChange={(e, value) => value && setInputValue(value)}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Search Play Store apps..."
            size="small"
            onKeyDown={handleKeyDown}
          />
        )}
      />
      <Button
        variant="contained"
        disableElevation
        startIcon={<SearchIcon />}
        onClick={triggerSearch}
        sx={{ whiteSpace: 'nowrap', px: 2.5, bgcolor: '#0E9F6E', '&:hover': { bgcolor: '#0B7A54' } }}
      ></Button>
    </Stack>
  );
}