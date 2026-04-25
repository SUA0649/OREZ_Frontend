import React, { useState } from 'react';
import axios from 'axios';

export default function AuthForm({ onAuth }) {
  const [isSignUp, setIsSignUp] = useState(true);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    const endpoint = isSignUp ? 'signup' : 'signin';
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/api/${endpoint}`, {
        user_name: userName,
        password
      });
      onAuth(res.data);
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Username"
        value={userName}
        onChange={e => setUserName(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />
      <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      <p style={{ textAlign: 'center', marginTop: '10px', cursor: 'pointer', color:'#00c6ff'}}
         onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </p>
    </form>
  );
}
