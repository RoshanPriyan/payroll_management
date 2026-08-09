import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormHelperText,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Close, Menu, Person } from '@mui/icons-material';
import { authApi } from '../../api/authApi.js';
import { locationApi } from '../../api/locationApi.js';

function getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem('user_info') || '{}');
  } catch {
    return {};
  }
}

function getProfileValue(userInfo, ...keys) {
  return keys.map((key) => userInfo[key]).find((item) => item !== undefined && item !== null && item !== '') || '';
}

function getProfileUserId(userInfo) {
  return getProfileValue(userInfo, 'user_id', 'userId', 'id');
}

function normalizeSelectValue(value) {
  return value === undefined || value === null ? '' : String(value);
}

function normalizeOptions(data) {
  const items = Array.isArray(data) ? data : data?.data;

  return Array.isArray(items)
    ? items.filter((item) => item?.id !== undefined && item?.id !== null && item?.name)
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

function mergeOption(options, option) {
  if (!option?.id || !option?.name || findOption(options, option.id)) {
    return options;
  }

  return [...options, option];
}

function getProfileLocationId(userInfo, ...keys) {
  return normalizeSelectValue(getProfileValue(userInfo, ...keys));
}

function getInitialProfileForm(userInfo) {
  return {
    tenant_name: getProfileValue(userInfo, 'tenant_name', 'business_name'),
    first_name: getProfileValue(userInfo, 'first_name'),
    last_name: getProfileValue(userInfo, 'last_name'),
    email: getProfileValue(userInfo, 'email'),
    phone: getProfileValue(userInfo, 'phone', 'phone_number'),
    address: getProfileValue(userInfo, 'address', 'address_details', 'address_line1'),
    pincode: getProfileValue(userInfo, 'pincode', 'zip_code'),
    country: getProfileValue(userInfo, 'country', 'country_name', 'countryName'),
    state: getProfileValue(userInfo, 'state', 'state_name', 'stateName'),
    city: getProfileValue(userInfo, 'city', 'city_name', 'cityName'),
    country_id: getProfileLocationId(userInfo, 'country_id', 'countryId'),
    state_id: getProfileLocationId(userInfo, 'state_id', 'stateId'),
    city_id: getProfileLocationId(userInfo, 'city_id', 'cityId'),
  };
}

function getProfileLocationNames(userInfo) {
  return {
    country: getProfileValue(userInfo, 'country', 'country_name', 'countryName'),
    state: getProfileValue(userInfo, 'state', 'state_name', 'stateName'),
    city: getProfileValue(userInfo, 'city', 'city_name', 'cityName'),
  };
}

function getFallbackLocationOption(id, name) {
  return id && name ? { id, name } : null;
}

function toApiId(value) {
  return value ? Number(value) : null;
}

function toApiString(value) {
  const normalizedValue = normalizeSelectValue(value).trim();
  return normalizedValue || null;
}

function resolveApiLocationId(value, options, displayName) {
  const selectedOption = findOption(options, value) || findOptionByName(options, displayName);
  return selectedOption ? toApiId(selectedOption.id) : toApiId(value);
}

function getResponseProfile(responseData) {
  return responseData?.data?.user || responseData?.data || responseData?.user || {};
}

function mergeUserDetailProfile(currentProfile, detailProfile) {
  const nextProfile = {
    ...currentProfile,
    ...detailProfile,
  };

  if (detailProfile.id && !detailProfile.user_id) {
    nextProfile.user_id = currentProfile.user_id || detailProfile.id;
  }

  if (detailProfile.zip_code && !detailProfile.pincode) {
    nextProfile.pincode = detailProfile.zip_code;
  }

  if (detailProfile.address && !detailProfile.address_details) {
    nextProfile.address_details = detailProfile.address;
  }

  return nextProfile;
}

function ProfileTextField({ className = '', ...props }) {
  return (
    <Box className={`profileFormField ${className}`.trim()}>
      <TextField fullWidth size="small" className="profileInput" {...props} />
    </Box>
  );
}

function LocationSelect({ placeholder, value, displayName, options, loading, onChange, onOpen }) {
  const selectedOption = findOption(options, value);
  const fallbackDisplayName = !selectedOption ? normalizeSelectValue(displayName) : '';
  const fallbackValue = fallbackDisplayName ? `__${placeholder.toLowerCase()}_display__` : '';
  const resolvedValue = selectedOption ? normalizeSelectValue(selectedOption.id) : fallbackValue;

  return (
    <FormControl fullWidth className="profileLocationSelect" size="small">
      <Select
        displayEmpty
        value={resolvedValue}
        onChange={onChange}
        onOpen={onOpen}
        MenuProps={{
          PaperProps: {
            sx: { zIndex: 1600, maxHeight: 260 },
          },
        }}
        renderValue={(selected) => {
          if (selected === fallbackValue) {
            return fallbackDisplayName;
          }

          if (!selected) {
            return <span className="profilePlaceholder">{placeholder}</span>;
          }

          return findOption(options, selected)?.name || <span className="profilePlaceholder">{placeholder}</span>;
        }}
      >
        {fallbackDisplayName && (
          <MenuItem value={fallbackValue} disabled>
            {fallbackDisplayName}
          </MenuItem>
        )}
        <MenuItem value="">
          <em>{placeholder}</em>
        </MenuItem>
        {loading && (
          <MenuItem disabled>
            Loading {placeholder.toLowerCase()}...
          </MenuItem>
        )}
        {options.map((option) => (
          <MenuItem key={option.id} value={normalizeSelectValue(option.id)}>
            {option.name}
          </MenuItem>
        ))}
        {!loading && options.length === 0 && (
          <MenuItem disabled>No {placeholder.toLowerCase()} found</MenuItem>
        )}
      </Select>
      {loading && (
        <FormHelperText className="profileSelectLoading">
          <CircularProgress size={13} /> Loading {placeholder.toLowerCase()}...
        </FormHelperText>
      )}
    </FormControl>
  );
}

export default function Header({ mobile, title, onOpenSidebar }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [savedProfile, setSavedProfile] = useState(() => getUserInfo());
  const [profileForm, setProfileForm] = useState(() => getInitialProfileForm(savedProfile));
  const [profileDetailLoading, setProfileDetailLoading] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(() => ({
    country_id: profileForm.country_id,
    state_id: profileForm.state_id,
    city_id: profileForm.city_id,
  }));
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState({
    countries: false,
    states: false,
    cities: false,
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const ownerName = [savedProfile.first_name, savedProfile.last_name].filter(Boolean).join(' ') || 'User';
  const tenantName = savedProfile.tenant_name || savedProfile.business_name || 'Business';
  const initials = [savedProfile.first_name, savedProfile.last_name]
    .filter(Boolean)
    .map((name) => name.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';
  const profileLocationNames = getProfileLocationNames(savedProfile);
  const profileCountryName = profileLocationNames.country;
  const profileStateName = profileLocationNames.state;
  const profileCityName = profileLocationNames.city;

  const loadCountries = useCallback(async () => {
    setLoadingLocations((current) => ({ ...current, countries: true }));
    try {
      const response = await locationApi.getCountries();
      const nextCountries = normalizeOptions(response.data);
      const matchedCountry = !selectedLocation.country_id
        ? findOptionByName(nextCountries, profileCountryName)
        : undefined;

      if (matchedCountry) {
        setSelectedLocation((current) => ({ ...current, country_id: normalizeSelectValue(matchedCountry.id) }));
        setProfileForm((current) => ({ ...current, country_id: normalizeSelectValue(matchedCountry.id) }));
      }

      setCountries(mergeOption(
        nextCountries,
        getFallbackLocationOption(selectedLocation.country_id, profileCountryName),
      ));
    } catch {
      setCountries([]);
    } finally {
      setLoadingLocations((current) => ({ ...current, countries: false }));
    }
  }, [profileCountryName, selectedLocation.country_id]);

  const loadStates = useCallback(async () => {
    setLoadingLocations((current) => ({ ...current, states: true }));
    try {
      const response = await locationApi.getStates(selectedLocation.country_id);
      let nextStates = normalizeOptions(response.data);
      const matchedState = !selectedLocation.state_id
        ? findOptionByName(nextStates, profileStateName)
        : undefined;

      if (matchedState) {
        setSelectedLocation((current) => ({ ...current, state_id: normalizeSelectValue(matchedState.id) }));
        setProfileForm((current) => ({ ...current, state_id: normalizeSelectValue(matchedState.id) }));
      }

      if (selectedLocation.state_id && !findOption(nextStates, selectedLocation.state_id)) {
        try {
          const allStatesResponse = await locationApi.getStates();
          const selectedState = findOption(normalizeOptions(allStatesResponse.data), selectedLocation.state_id);
          nextStates = mergeOption(
            nextStates,
            selectedState || getFallbackLocationOption(selectedLocation.state_id, profileStateName),
          );
        } catch {
          nextStates = mergeOption(
            nextStates,
            getFallbackLocationOption(selectedLocation.state_id, profileStateName),
          );
        }
      }

      setStates(nextStates);
    } catch {
      setStates([]);
    } finally {
      setLoadingLocations((current) => ({ ...current, states: false }));
    }
  }, [profileStateName, selectedLocation.country_id, selectedLocation.state_id]);

  const loadCities = useCallback(async () => {
    setLoadingLocations((current) => ({ ...current, cities: true }));
    try {
      const response = await locationApi.getCities(selectedLocation.state_id);
      let nextCities = normalizeOptions(response.data);
      const matchedCity = !selectedLocation.city_id
        ? findOptionByName(nextCities, profileCityName)
        : undefined;

      if (matchedCity) {
        setSelectedLocation((current) => ({ ...current, city_id: normalizeSelectValue(matchedCity.id) }));
        setProfileForm((current) => ({ ...current, city_id: normalizeSelectValue(matchedCity.id) }));
      }

      if (selectedLocation.city_id && !findOption(nextCities, selectedLocation.city_id)) {
        try {
          const allCitiesResponse = await locationApi.getCities();
          const selectedCity = findOption(normalizeOptions(allCitiesResponse.data), selectedLocation.city_id);
          nextCities = mergeOption(
            nextCities,
            selectedCity || getFallbackLocationOption(selectedLocation.city_id, profileCityName),
          );
        } catch {
          nextCities = mergeOption(
            nextCities,
            getFallbackLocationOption(selectedLocation.city_id, profileCityName),
          );
        }
      }

      setCities(nextCities);
    } catch {
      setCities([]);
    } finally {
      setLoadingLocations((current) => ({ ...current, cities: false }));
    }
  }, [profileCityName, selectedLocation.city_id, selectedLocation.state_id]);

  useEffect(() => {
    const timer = window.setTimeout(loadCountries, 0);
    return () => window.clearTimeout(timer);
  }, [loadCountries]);

  useEffect(() => {
    const timer = window.setTimeout(loadStates, 0);
    return () => window.clearTimeout(timer);
  }, [loadStates]);

  useEffect(() => {
    const timer = window.setTimeout(loadCities, 0);
    return () => window.clearTimeout(timer);
  }, [loadCities]);

  const resetProfileForm = (profile) => {
    const nextForm = getInitialProfileForm(profile);
    setProfileForm(nextForm);
    setSelectedLocation({
      country_id: nextForm.country_id,
      state_id: nextForm.state_id,
      city_id: nextForm.city_id,
    });
  };

  const handleOpenProfile = async () => {
    const currentProfile = getUserInfo();
    const userId = getProfileUserId(currentProfile);

    setSavedProfile(currentProfile);
    resetProfileForm(currentProfile);
    setProfileError('');
    setProfileOpen(true);

    if (!userId) {
      setProfileError('Unable to load user details because user id is missing.');
      return;
    }

    setProfileDetailLoading(true);
    try {
      const response = await authApi.getUserDetail(userId);
      const detailProfile = getResponseProfile(response.data);
      const updatedProfile = mergeUserDetailProfile(currentProfile, detailProfile);

      localStorage.setItem('user_info', JSON.stringify(updatedProfile));
      setSavedProfile(updatedProfile);
      resetProfileForm(updatedProfile);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Unable to load latest user details.');
    } finally {
      setProfileDetailLoading(false);
    }
  };

  const handleCloseProfile = () => {
    resetProfileForm(savedProfile);
    setProfileError('');
    setProfileOpen(false);
  };

  const handleProfileFieldChange = (event) => {
    const { name, value } = event.target;
    setProfileForm((current) => ({
      ...current,
      [name]: name === 'phone' ? value.replace(/\D/g, '').slice(0, 10) : value,
    }));
  };

  const handleCountryChange = (event) => {
    const countryId = event.target.value;
    setSelectedLocation({
      country_id: countryId,
      state_id: '',
      city_id: '',
    });
    setProfileForm((current) => ({
      ...current,
      country_id: countryId,
      country: findOption(countries, countryId)?.name || '',
      state_id: '',
      state: '',
      city_id: '',
      city: '',
    }));
  };

  const handleStateChange = (event) => {
    const stateId = event.target.value;
    setSelectedLocation((current) => ({
      ...current,
      state_id: stateId,
      city_id: '',
    }));
    setProfileForm((current) => ({
      ...current,
      state_id: stateId,
      state: findOption(states, stateId)?.name || '',
      city_id: '',
      city: '',
    }));
  };

  const handleCityChange = (event) => {
    const cityId = event.target.value;
    setSelectedLocation((current) => ({
      ...current,
      city_id: cityId,
    }));
    setProfileForm((current) => ({
      ...current,
      city_id: cityId,
      city: findOption(cities, cityId)?.name || '',
    }));
  };

  const handleSaveProfile = async () => {
    const selectedCountry = findOption(countries, selectedLocation.country_id);
    const selectedState = findOption(states, selectedLocation.state_id);
    const selectedCity = findOption(cities, selectedLocation.city_id);
    const countryId = resolveApiLocationId(selectedLocation.country_id, countries, profileForm.country);
    const stateId = resolveApiLocationId(selectedLocation.state_id, states, profileForm.state);
    const cityId = resolveApiLocationId(selectedLocation.city_id, cities, profileForm.city);
    const payload = {
      first_name: toApiString(profileForm.first_name),
      last_name: toApiString(profileForm.last_name),
      address: toApiString(profileForm.address),
      country_id: countryId,
      state_id: stateId,
      city_id: cityId,
      zip_code: toApiString(profileForm.pincode),
    };

    setSavingProfile(true);
    setProfileError('');

    try {
      const response = await authApi.updateUserProfile(payload);
      const responseProfile = getResponseProfile(response.data);
      const updatedProfile = {
        ...savedProfile,
        ...responseProfile,
        ...payload,
        pincode: payload.zip_code,
        address_details: payload.address,
        country: selectedCountry?.name || profileForm.country || savedProfile.country || savedProfile.country_name || '',
        country_name: selectedCountry?.name || profileForm.country || savedProfile.country_name || savedProfile.country || '',
        state: selectedState?.name || profileForm.state || savedProfile.state || savedProfile.state_name || '',
        state_name: selectedState?.name || profileForm.state || savedProfile.state_name || savedProfile.state || '',
        city: selectedCity?.name || profileForm.city || savedProfile.city || savedProfile.city_name || '',
        city_name: selectedCity?.name || profileForm.city || savedProfile.city_name || savedProfile.city || '',
      };

      localStorage.setItem('user_info', JSON.stringify(updatedProfile));
      setSavedProfile(updatedProfile);
      resetProfileForm(updatedProfile);
      setProfileOpen(false);
    } catch (error) {
      setProfileError(error.response?.data?.message || 'Unable to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  return (
    <Box className="topbar">
      <Stack className="topLeft" direction="row" alignItems="center" gap={1.5}>
        {mobile && (
          <IconButton onClick={onOpenSidebar}>
            <Menu />
          </IconButton>
        )}
        <Typography className="pageTitle">{title}</Typography>
      </Stack>
      <Stack className="topbarRight" direction="row" alignItems="center" gap={1.5}>
        <Box component="button" type="button" className="profilePill profileButton" onClick={handleOpenProfile}>
          <Avatar sx={{ background: 'linear-gradient(135deg, #2563eb, #3B82F6)', color: '#fff', width: 32, height: 32, fontSize: 13, fontWeight: 800 }}>{initials}</Avatar>
          <Box className="owner">
            <b>{tenantName}</b>
            <Typography className="muted">{ownerName}</Typography>
          </Box>
        </Box>
      </Stack>
      <Dialog
        open={profileOpen}
        onClose={handleCloseProfile}
        fullWidth
        maxWidth="sm"
        PaperProps={{ className: 'profileDialogPaper' }}
      >
        <DialogTitle className="profileDialogHeader">
          <Box component="span">
            <Person fontSize="small" />
            User Profile
          </Box>
          <IconButton className="profileDialogClose" aria-label="Close profile" onClick={handleCloseProfile}>
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent className="profileDialogBody">
          <Stack direction="row" alignItems="center" gap={1.5} mb={2}>
            <Avatar sx={{ bgcolor: '#dbeafe', color: '#2563eb', width: 44, height: 44, fontSize: 15, fontWeight: 800 }}>{initials}</Avatar>
            <Box>
              <Typography fontWeight={800}>{profileForm.tenant_name || 'Business'}</Typography>
              <Typography className="muted">
                {[profileForm.first_name, profileForm.last_name].filter(Boolean).join(' ') || 'User'}
              </Typography>
            </Box>
          </Stack>
          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}
          {profileDetailLoading && (
            <Alert icon={<CircularProgress size={16} />} severity="info" sx={{ mb: 2 }}>
              Loading latest user details...
            </Alert>
          )}
          <Box className="profileFormGrid">
            <ProfileTextField
              name="tenant_name"
              placeholder="Business Name"
              value={profileForm.tenant_name}
              onChange={handleProfileFieldChange}
            />
            <ProfileTextField
              name="first_name"
              placeholder="First Name"
              value={profileForm.first_name}
              onChange={handleProfileFieldChange}
            />
            <ProfileTextField
              name="last_name"
              placeholder="Last Name"
              value={profileForm.last_name}
              onChange={handleProfileFieldChange}
            />
            <ProfileTextField
              name="email"
              type="email"
              placeholder="Email"
              value={profileForm.email}
              onChange={handleProfileFieldChange}
            />
            <ProfileTextField
              name="phone"
              placeholder="Phone"
              value={profileForm.phone}
              onChange={handleProfileFieldChange}
              slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 10, pattern: '[0-9]*' } }}
            />
            <ProfileTextField
              name="address"
              placeholder="Address"
              value={profileForm.address}
              onChange={handleProfileFieldChange}
              multiline
              minRows={2}
              className="profileFormFieldWide"
            />
            <Box className="profileFormField">
              <LocationSelect
                placeholder="Country"
                value={selectedLocation.country_id}
                displayName={profileForm.country}
                options={countries}
                loading={loadingLocations.countries}
                onChange={handleCountryChange}
                onOpen={loadCountries}
              />
            </Box>
            <Box className="profileFormField">
              <LocationSelect
                placeholder="State"
                value={selectedLocation.state_id}
                displayName={profileForm.state}
                options={states}
                loading={loadingLocations.states}
                onChange={handleStateChange}
                onOpen={loadStates}
              />
            </Box>
            <Box className="profileFormField">
              <LocationSelect
                placeholder="City"
                value={selectedLocation.city_id}
                displayName={profileForm.city}
                options={cities}
                loading={loadingLocations.cities}
                onChange={handleCityChange}
                onOpen={loadCities}
              />
            </Box>
            <ProfileTextField
              name="pincode"
              placeholder="Pincode"
              value={profileForm.pincode}
              onChange={handleProfileFieldChange}
            />
          </Box>
        </DialogContent>
        <DialogActions className="profileDialogActions">
          <Button variant="outlined" onClick={handleCloseProfile} disabled={savingProfile}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveProfile} disabled={savingProfile || profileDetailLoading}>
            {savingProfile ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
