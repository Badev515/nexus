import { useEffect, useState } from 'react';
import { Autocomplete, TextField } from '@mui/material';
import { getAllCountries } from '../api/countries.api';

export const WORLDWIDE = { name: '🌍 Worldwide', alpha2Code: '' };

export default function CountrySelect({ value, onChange }) {
  const [countries, setCountries] = useState([WORLDWIDE]);

  useEffect(() => {
    getAllCountries()
      .then((data) => setCountries([WORLDWIDE, ...(data || [])]))
      .catch(() => {});
  }, []);

  return (
    <Autocomplete
      options={countries}
      getOptionLabel={(c) => c.name || ''}
      isOptionEqualToValue={(a, b) => a.alpha2Code === b.alpha2Code}
      value={value}
      onChange={(e, newVal) => onChange(newVal || WORLDWIDE)}
      renderInput={(params) => <TextField {...params} label="Country" size="small" />}
      fullWidth
    />
  );
}