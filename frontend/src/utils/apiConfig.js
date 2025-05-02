// frontend/src/utils/apiConfig.js
const API_BASE_URL_DEV = 'http://localhost:5000'; // Default development URL
const API_BASE_URL_PROD = 'https://learniverse-0ow7.onrender.com';

const API_BASE_URL = process.env.NODE_ENV === 'development'
  ? API_BASE_URL_DEV
  : API_BASE_URL_PROD;

export default API_BASE_URL;