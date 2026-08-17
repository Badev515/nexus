// import axios from 'axios';

// const api = axios.create({
//   baseURL: import.meta.env.VITE_API_BASE_URL,
// });

// export default api;

import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const config = error.config;
    if (error.response?.status === 429 && !config._retried) {
      config._retried = true;
      await new Promise((r) => setTimeout(r, 400)); // thoda ruk ke retry
      return api(config);
    }
    return Promise.reject(error);
  }
);

export default api;