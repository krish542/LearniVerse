// frontend/src/admin/pages/AdminLogin.js
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import API_BASE_URL from '../../utils/apiConfig';
const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_BASE_URL}/api/admin/login`, { username, password });
      console.log('Login successful:', response.data); 
      localStorage.setItem('adminToken', response.data.token);
      console.log('Token stored:', localStorage.getItem('adminToken'));
      navigate('/admin/dashboard'); // Redirect to admin dashboard
      console.log('Navigating to /admin/dashboard');
    } catch (error) {
      console.error(error);
      alert('Login failed');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#000000', color: 'white' }}>
      <form onSubmit={handleSubmit} style={{ width: '300px', padding: '20px', border: '1px solid #F38380' }}>
        <h2>Admin Login</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', backgroundColor: '#333', color: 'white', border: 'none' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', margin: '10px 0', backgroundColor: '#333', color: 'white', border: 'none' }}
        />
        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#F38380', color: 'white', border: 'none' }}>Login</button>
      </form>
    </div>
  );
};

export default AdminLogin;