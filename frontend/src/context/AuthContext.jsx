import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on page load
  useEffect(() => {
    const checkLoggedIn = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('http://localhost:8000/api/auth/me', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    checkLoggedIn();
  }, []);

  const login = async (username, password) => {
    // Form data for OAuth2 format
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    const response = await axios.post('http://localhost:8000/api/auth/login', formData);
    const { access_token } = response.data;
    
    localStorage.setItem('token', access_token);
    
    // Fetch user details immediately after login
    const userRes = await axios.get('http://localhost:8000/api/auth/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    setUser(userRes.data);
    return true;
  };

  const register = async (username, password, email) => {
    await axios.post('http://localhost:8000/api/auth/register', {
      username,
      password,
      email
    });
    // Auto login after register
    return login(username, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);