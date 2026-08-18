import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { businessApi } from '../../api/businessApi.js';
import { locationApi } from '../../api/locationApi.js';
import FormField from '../../components/common/FormField.jsx';

const emptyBusinessForm = {
  business_name: '',
  address: '',
  zip_code: '',
  country_id: '',
  state_id: '',
  city_id: '',
  country: '',
  state: '',
  city: '',
};

function normalizeSelectValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function normalizeOptions(data) {
  const items = Array.isArray(data) ? data : data?.data;

  return Array.isArray(items)
    ? items
      .map((item) => ({
        ...item,
        id: item?.id ?? item?.country_id ?? item?.state_id ?? item?.city_id,
        name: item?.name ?? item?.country_name ?? item?.state_name ?? item?.city_name,
      }))
      .filter((item) => item.id !== undefined && item.id !== null && item.name)
    : [];
}

function findOption(options, value) {
  const normalizedValue = normalizeSelectValue(value);
  return options.find((option) => normalizeSelectValue(option.id) === normalizedValue);
}

function findOptionByName(options, name) {
  const normalizedName = normalizeSelectValue(name).trim().toLowerCase();
  return normalizedName
    ? options.find((option) => normalizeSelectValue(option.name).trim().toLowerCase() === normalizedName)
    : undefined;
}

function getLocationId(value) {
  if (value && typeof value === 'object') {
    return normalizeSelectValue(value.id ?? value.country_id ?? value.state_id ?? value.city_id);
  }

  return typeof value === 'number' ? normalizeSelectValue(value) : '';
}

function getLocationName(value) {
  if (value && typeof value === 'object') {
    return normalizeSelectValue(value.name ?? value.country_name ?? value.state_name ?? value.city_name);
  }

  return typeof value === 'string' ? value : '';
}

function getBusinessFromResponse(data) {
  return data?.data?.business || data?.data || data?.business || {};
}

function buildBusinessForm(business = {}) {
  return {
    ...emptyBusinessForm,
    business_name: business.business_name || '',
    address: business.address || business.address_details || '',
    zip_code: business.zip_code || '',
    country_id: normalizeSelectValue(business.country_id || getLocationId(business.country)),
    state_id: normalizeSelectValue(business.state_id || getLocationId(business.state)),
    city_id: normalizeSelectValue(business.city_id || getLocationId(business.city)),
    country: business.country_name || getLocationName(business.country),
    state: business.state_name || getLocationName(business.state),
    city: business.city_name || getLocationName(business.city),
  };
}

function normalizeComparableValue(value) {
  return normalizeSelectValue(value).trim();
}

function buildUpdatePayload(id, form, initialForm) {
  const payload = { id: Number(id) };
  const fields = ['business_name', 'address', 'country_id', 'state_id', 'city_id', 'zip_code'];

  fields.forEach((field) => {
    const currentValue = normalizeComparableValue(form[field]);
    const initialValue = normalizeComparableValue(initialForm[field]);

    if (currentValue !== initialValue) {
      payload[field] = currentValue;
    }
  });

  return payload;
}

export default function SettingsPage() {
  const [form, setForm] = useState(emptyBusinessForm);
  const [initialForm, setInitialForm] = useState(emptyBusinessForm);
  const [businessId, setBusinessId] = useState('');
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const loadCountries = useCallback(async (countryName = '') => {
    const response = await locationApi.getCountries();
    const nextCountries = normalizeOptions(response.data);
    const matchedCountry = findOptionByName(nextCountries, countryName);

    setCountries(nextCountries);
    return matchedCountry;
  }, []);

  const loadStates = useCallback(async (countryId = '', stateName = '') => {
    const response = await locationApi.getStates(countryId);
    const nextStates = normalizeOptions(response.data);
    const matchedState = findOptionByName(nextStates, stateName);

    setStates(nextStates);
    return matchedState;
  }, []);

  const loadCities = useCallback(async (stateId = '', cityName = '') => {
    const response = await locationApi.getCities(stateId);
    const nextCities = normalizeOptions(response.data);
    const matchedCity = findOptionByName(nextCities, cityName);

    setCities(nextCities);
    return matchedCity;
  }, []);

  useEffect(() => {
    let ignore = false;

    async function loadSettings() {
      setLoading(true);
      setError('');

      try {
        const response = await businessApi.getBusinessById();
        const business = getBusinessFromResponse(response.data);
        const nextForm = buildBusinessForm(business);
        const matchedCountry = !nextForm.country_id ? await loadCountries(nextForm.country) : null;
        const countryId = nextForm.country_id || normalizeSelectValue(matchedCountry?.id);
        const matchedState = countryId && !nextForm.state_id ? await loadStates(countryId, nextForm.state) : null;
        const stateId = nextForm.state_id || normalizeSelectValue(matchedState?.id);
        const matchedCity = stateId && !nextForm.city_id ? await loadCities(stateId, nextForm.city) : null;

        if (countryId && nextForm.country_id) await loadStates(countryId, nextForm.state);
        if (stateId && nextForm.state_id) await loadCities(stateId, nextForm.city);

        if (!ignore) {
          const resolvedForm = {
            ...nextForm,
            country_id: countryId,
            state_id: stateId,
            city_id: nextForm.city_id || normalizeSelectValue(matchedCity?.id),
          };

          setBusinessId(normalizeSelectValue(business.id));
          setForm(resolvedForm);
          setInitialForm(resolvedForm);
        }
      } catch (apiError) {
        if (!ignore) {
          setError(apiError.response?.data?.message || 'Unable to load business settings.');
          setForm(emptyBusinessForm);
          setInitialForm(emptyBusinessForm);
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    loadSettings();

    return () => {
      ignore = true;
    };
  }, [loadCities, loadCountries, loadStates]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setSuccessMessage('');
    setError('');
    setForm((current) => ({
      ...current,
      [name]: name === 'zip_code' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  const handleCountryChange = async (event) => {
    const countryId = event.target.value;
    const country = findOption(countries, countryId);

    setSuccessMessage('');
    setError('');
    setForm((current) => ({
      ...current,
      country_id: countryId,
      country: country?.name || '',
      state_id: '',
      state: '',
      city_id: '',
      city: '',
    }));
    setStates([]);
    setCities([]);

    if (countryId) {
      try {
        await loadStates(countryId);
      } catch {
        setStates([]);
      }
    }
  };

  const handleStateChange = async (event) => {
    const stateId = event.target.value;
    const state = findOption(states, stateId);

    setSuccessMessage('');
    setError('');
    setForm((current) => ({
      ...current,
      state_id: stateId,
      state: state?.name || '',
      city_id: '',
      city: '',
    }));
    setCities([]);

    if (stateId) {
      try {
        await loadCities(stateId);
      } catch {
        setCities([]);
      }
    }
  };

  const handleCityChange = (event) => {
    const cityId = event.target.value;
    const city = findOption(cities, cityId);

    setSuccessMessage('');
    setError('');
    setForm((current) => ({
      ...current,
      city_id: cityId,
      city: city?.name || '',
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!businessId) {
      setError('Unable to update business settings because business id is missing.');
      return;
    }

    const payload = buildUpdatePayload(businessId, form, initialForm);
    const hasChanges = Object.keys(payload).some((field) => field !== 'id');

    if (!hasChanges) {
      setError('Change at least one field before saving.');
      return;
    }

    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await businessApi.updateBusinessById(payload);
      const message = response.data?.message || 'Business settings saved.';

      if (response.data?.success === false) {
        throw new Error(message);
      }

      setInitialForm(form);
      setSuccessMessage(message);
    } catch (apiError) {
      setError(apiError.message || apiError.response?.data?.message || 'Unable to update business settings.');
    } finally {
      setSaving(false);
    }
  };

  const isBusy = loading || saving;

  return (
    <Box className="page formPage">
      <Typography variant="h5">Settings</Typography>
      <Typography className="muted" mb={3}>Control your business details and notification preferences.</Typography>
      <Card>
        <CardContent>
          <Box component="form" onSubmit={handleSave}>
            <Typography variant="h6" mb={2}>Business information</Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}
            {loading && <Alert severity="info" sx={{ mb: 2 }}>Loading business details...</Alert>}
            <Grid container spacing={2.5}>
              <FormField
                label="Business name"
                name="business_name"
                value={form.business_name}
                onChange={handleChange}
                disabled={isBusy}
              />
              <FormField
                label="Address"
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={isBusy}
              />
              <FormField
                label="Zip code"
                name="zip_code"
                value={form.zip_code}
                onChange={handleChange}
                disabled={isBusy}
                slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10, pattern: '[0-9]*' } }}
              />
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Country"
                  value={form.country_id}
                  onChange={handleCountryChange}
                  onOpen={() => loadCountries(form.country).catch(() => setCountries([]))}
                  disabled={isBusy}
                >
                  <MenuItem value="">Select country</MenuItem>
                  {countries.map((country) => (
                    <MenuItem key={country.id} value={normalizeSelectValue(country.id)}>{country.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="State"
                  value={form.state_id}
                  onChange={handleStateChange}
                  onOpen={() => loadStates(form.country_id, form.state).catch(() => setStates([]))}
                  disabled={isBusy || !form.country_id}
                >
                  <MenuItem value="">Select state</MenuItem>
                  {states.map((state) => (
                    <MenuItem key={state.id} value={normalizeSelectValue(state.id)}>{state.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="City"
                  value={form.city_id}
                  onChange={handleCityChange}
                  onOpen={() => loadCities(form.state_id, form.city).catch(() => setCities([]))}
                  disabled={isBusy || !form.state_id}
                >
                  <MenuItem value="">Select city</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={normalizeSelectValue(city.id)}>{city.name}</MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
            <Typography variant="h6" mt={4} mb={2}>Preferences</Typography>
            <Stack gap={1}>
              <Stack direction="row" justifyContent="space-between" className="setting">
                <Box>
                  <b>Dark theme</b>
                  <Typography className="muted">Use a dark color scheme</Typography>
                </Box>
                <input type="checkbox" />
              </Stack>
              <Stack direction="row" justifyContent="space-between" className="setting">
                <Box>
                  <b>Notifications</b>
                  <Typography className="muted">Receive payment reminders</Typography>
                </Box>
                <input type="checkbox" defaultChecked />
              </Stack>
            </Stack>
            <Button type="submit" variant="contained" sx={{ mt: 3 }} disabled={isBusy}>
              {saving ? 'Saving...' : 'Save changes'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
