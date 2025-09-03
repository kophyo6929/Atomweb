import React, { useState } from 'react';
import { Logo } from './components';

// --- AUTHENTICATION COMPONENTS --- //

interface AuthProps {
    onLoginSuccess: (username: string, password?: string) => void;
    onRegisterSuccess: (username: string) => void;
}

const AuthPage = ({ onLoginSuccess, onRegisterSuccess }: AuthProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <div className="auth-container">
      <Logo />
      <div className="auth-form-wrapper">
        {isLoginView ? (
          <LoginForm onToggleView={toggleView} onLoginSuccess={onLoginSuccess} />
        ) : (
          <RegisterForm onToggleView={toggleView} onRegisterSuccess={onRegisterSuccess} />
        )}
      </div>
    </div>
  );
};

interface LoginFormProps {
    onToggleView: () => void;
    onLoginSuccess: (username: string, password?: string) => void;
}

const LoginForm = ({ onToggleView, onLoginSuccess }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(username, password);
  };

  return (
    <>
      <h1>Sign In</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
         <div className="input-group">
          <label htmlFor="login-username">Username</label>
          <input id="login-username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-label="Username" />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">Password</label>
          <input id="login-password" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="Password" />
        </div>
        <div className="forgot-password-container">
            <button
                type="button"
                className="forgot-password-link"
                onClick={() => alert('Password recovery feature is coming soon!')}
            >
                Forgot Password?
            </button>
        </div>
        <button type="submit" className="submit-button">Login</button>
      </form>
      <div className="toggle-form-container">
        <span>Don't have an account? </span>
        <button onClick={onToggleView} className="toggle-form-link" aria-label="Switch to registration form">Register</button>
      </div>
    </>
  );
};

interface RegisterFormProps {
    onToggleView: () => void;
    onRegisterSuccess: (username: string) => void;
}

const RegisterForm = ({ onToggleView, onRegisterSuccess }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    onRegisterSuccess(username); // Simulate auto-login after register
  };

  return (
    <>
      <h1>Create an Account</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="register-username">Username</label>
          <input id="register-username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-label="Username" />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">Password</label>
          <input id="register-password" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label="Password" />
        </div>
        <div className="input-group">
          <label htmlFor="register-confirm-password">Confirm Password</label>
          <input id="register-confirm-password" className="input-field" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-label="Confirm Password" />
        </div>
        <button type="submit" className="submit-button">Register</button>
      </form>
      <div className="toggle-form-container">
        <span>Already have an account? </span>
        <button onClick={onToggleView} className="toggle-form-link" aria-label="Switch to login form">Login</button>
      </div>
    </>
  );
};

export default AuthPage;
