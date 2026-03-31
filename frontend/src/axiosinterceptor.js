import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:5000',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.token = token;   // same header key as blog app
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axiosInstance;