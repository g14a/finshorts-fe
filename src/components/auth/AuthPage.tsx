import React, { useState } from 'react';
import axios from 'axios';
import './Auth.css';
import { BACKEND_ROOT_URL } from '../constants';

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [identifier, setIdentifier] = useState(''); // New identifier field for login
  const [email, setEmail] = useState(''); // Email field for signup
  const [username, setUsername] = useState(''); // Username field for signup
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const url = isLoginMode
        ? `${BACKEND_ROOT_URL}/users/login`
        : `${BACKEND_ROOT_URL}/users/signup`;

      const payload = isLoginMode
        ? { identifier, password }
        : { username, email, password };

      const response = await axios.post(url, payload);

      if (response.status === 200) {
        const data = response.data;

        if (data.token) {
          localStorage.setItem('authToken', data.token);
          window.location.href = '/';
          return;
        }
      } else if (response.status === 404) {
        setError('User not found. Please sign up.');
        setIsLoginMode(false); 
      } else {
        setError(response.data.message || 'Something went wrong.');
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || 'An error occurred. Please try again.');
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-2xl mb-4">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col">
        {isLoginMode ? (
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Username or Email"
            className="mb-4 p-2 border rounded"
            required
          />
        ) : (
          <>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username"
              className="mb-4 p-2 border rounded"
              required
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="mb-4 p-2 border rounded"
              required
            />
          </>
        )}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="mb-4 p-2 border rounded"
          required
        />
        <button
          type="submit"
          className="bg-teal-700 text-white p-2 rounded"
        >
          {isLoginMode ? 'Login' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};

export default AuthPage;
