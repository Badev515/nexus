


import api from './axios';

export const getTrend = (keyword, geo, range) =>
  api.get('/trends/interest', { params: { keyword, geo, range } }).then((res) => res.data);

export const getRelatedQueries = (keyword, geo, range) =>
  api.get('/trends/related', { params: { keyword, geo, range } }).then((res) => res.data);