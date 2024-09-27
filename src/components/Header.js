// src/components/Header.js

import React from 'react';

function Header({ user, onLogout, onShowAuthPage, onSwitchToSignUp }) {
  return (
    <header className="header">
      <h1>Generative Mind Map</h1>
      <div className="header-buttons">
        {user ? (
          <>
            <span className="user-info">Welcome, {user.email}</span>
            <button className="logout-button" onClick={onLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <button className="login-button" onClick={onShowAuthPage}>
              Login
            </button>
            <button className="signup-button" onClick={onSwitchToSignUp}>
              Sign Up
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
