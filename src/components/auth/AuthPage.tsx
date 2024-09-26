import React, { useState } from 'react';
import axios from 'axios';
import { BACKEND_ROOT_URL } from '../constants';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const AuthPage: React.FC = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [identifier, setIdentifier] = useState(''); 
  const [email, setEmail] = useState(''); 
  const [username, setUsername] = useState(''); 
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handlePasswordVisibilityToggle = () => {
    setPasswordVisible(!passwordVisible);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const url = isLoginMode
      ? `${BACKEND_ROOT_URL}/users/login`
      : `${BACKEND_ROOT_URL}/users/signup`;

    const payload = isLoginMode
      ? { identifier, password }
      : { username, email, password };

    try {
      const response = await axios.post(url, payload);

      if (response.status === 200 || response.status === 201) {
        const data = response.data;
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          window.location.href = '/';
        } else if (!isLoginMode) {
          setError(null);
          setSuccess("We have sent you an email. Please verify.");
        }
      }
    } catch (error) {
      setSuccess('');  
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            setError('User not found. Please sign up.');
            setIsLoginMode(false);
          } else {
            setError(error.response.data || 'Something went wrong.');
          }
        } else {
          setError('No response from server. Please try again later.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <div className="auth-container">
      <h2 className="text-2xl mb-4">{isLoginMode ? 'Login' : 'Sign Up'}</h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {success && <div className="text-green-500 mb-4">{success}</div>}
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
        <div className="relative mb-4">
          <input
            type={passwordVisible ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 border rounded"
            required
          />
          <span
            className="absolute inset-y-0 right-0 pr-3 pb-4 flex items-center cursor-pointer"
            onClick={handlePasswordVisibilityToggle}
          >
            {passwordVisible ? <FaEyeSlash /> : <FaEye />}
          </span>
        </div>
        <button
          type="submit"
          className="bg-teal-700 text-white p-2 rounded"
        >
          {isLoginMode ? 'Login' : 'Sign Up'}
        </button>
      </form>
      {isLoginMode ? (
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-teal-700 hover:underline"
            onClick={() => setIsLoginMode(false)}
          >
            Don't have an account? Sign up
          </a>
        </div>
      ) : (
        <div className="mt-4 text-center">
          <a
            href="#"
            className="text-teal-700 hover:underline"
            onClick={() => setIsLoginMode(true)}
          >
            Already have an account? Login
          </a>
        </div>
      )}
    </div>
  );
};

export default AuthPage;
