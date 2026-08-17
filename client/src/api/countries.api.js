import api from './axios';

export const getAllCountries = () => api.get('/countries').then((res) => res.data);