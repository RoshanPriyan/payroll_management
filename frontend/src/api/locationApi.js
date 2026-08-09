import axiosClient from '../services/axiosClient.js';

export const locationApi = {
  getCountries: () => axiosClient.get('/v1/location/country-list'),
  getStates: (countryId) => axiosClient.get('/v1/location/state-list', {
    params: countryId ? { country_id: countryId } : undefined,
  }),
  getCities: (stateId) => axiosClient.get('/v1/location/city-list', {
    params: stateId ? { state_id: stateId } : undefined,
  }),
};
