import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

const Login = ({ setUser }) => {

  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError('');

    try {

      // Fetch all users and match username
      const res = await axios.get(`${API_URL}/api/users`);

      const users = res.data;

      const found = users.find(
        u => u.username === username
      );

      if (found) {

        setUser(found);

        navigate('/chats');

      } else {

        setError('Invalid username');
      }

    } catch (err) {

      setError('Error connecting to server');
    }
  };

  return (
    <div className="login-container">

      <h2>Login</h2>

      <form onSubmit={handleSubmit}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />

        <button type="submit">
          Login
        </button>

      </form>

      {error && (
        <div style={{ color: 'red' }}>
          {error}
        </div>
      )}

    </div>
  );
};

export default Login;