import axios from 'axios';

const axiosInstance = axios.create({
	baseURL: 'https://meal-subscription-backend.onrender.com', // Your backend URL
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
});

// Add token to requests if it exists
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem('token');
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

export default axiosInstance;
