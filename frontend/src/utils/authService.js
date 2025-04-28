import { jwtDecode } from 'jwt-decode';

const getToken = () => localStorage.getItem('token');

const isTokenExpired = () => {
    const token = getToken();
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        return decoded.exp < Math.floor(Date.now() / 1000);
    } catch (error) {
        return true;
    }
};

const getAuthHeader = () => {
    const token = getToken();
    if (token && !isTokenExpired()) {
        return { 'x-auth-token': token };
    }
    // Implement your token refresh logic here or redirect to login
    console.log('Token expired or invalid.');
    return {};
};

export { getToken, isTokenExpired, getAuthHeader };