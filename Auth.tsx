import React, { useState } from 'react';
import { Logo } from './components';
import { User } from './types';

// --- AUTHENTICATION COMPONENTS --- //

interface AuthProps {
    onLoginSuccess: (username: string, password?: string) => void;
    onRegisterSuccess: (username: string, password: string, securityAmount: number) => void;
    onPasswordReset: (userId: number, newPassword: string) => void;
    users: User[];
}

const AuthPage = ({ onLoginSuccess, onRegisterSuccess, onPasswordReset, users }: AuthProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const toggleView = () => setIsLoginView(!isLoginView);

  return (
    <div className="auth-container">
      <Logo />
      <div className="auth-form-wrapper">
        {isLoginView ? (
          <LoginForm onToggleView={toggleView} onLoginSuccess={onLoginSuccess} users={users} onPasswordReset={onPasswordReset} />
        ) : (
          <RegisterForm onToggleView={toggleView} onRegisterSuccess={onRegisterSuccess} />
        )}
      </div>
    </div>
  );
};

interface ForgotPasswordModalProps {
    onClose: () => void;
    users: User[];
    onPasswordReset: (userId: number, newPassword: string) => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ onClose, users, onPasswordReset }) => {
    const [step, setStep] = useState<'verify' | 'reset'>('verify');
    const [userIdInput, setUserIdInput] = useState('');
    const [securityAmountInput, setSecurityAmountInput] = useState('');
    const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const id = parseInt(userIdInput, 10);
        const amount = parseInt(securityAmountInput, 10);

        if (isNaN(id) || isNaN(amount)) {
            alert('Please enter valid numbers for User ID and Security Amount.');
            return;
        }

        const user = users.find(u => u.id === id);

        if (user && user.securityAmount === amount) {
            setVerifiedUser(user);
            setStep('reset');
        } else {
            alert('Invalid User ID or Security Amount. Please try again.');
        }
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifiedUser) return;

        if (!newPassword || newPassword.length < 6) {
             alert('Password must be at least 6 characters long.');
             return;
        }

        if (newPassword !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        
        onPasswordReset(verifiedUser.id, newPassword);
        alert(`Password for ${verifiedUser.username} has been reset successfully!\nYou can now log in with your new password.`);
        onClose();
    };


    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                {step === 'verify' ? (
                <>
                    <h3>Forgot Password</h3>
                    <p>Enter your 6-digit User ID and 4-digit security amount to recover your account.</p>
                    <form onSubmit={handleVerifySubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="recovery-userid">User ID</label>
                            <input id="recovery-userid" className="input-field" type="number" value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder="6-digit ID" required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="recovery-amount">Security Amount</label>
                            <input id="recovery-amount" className="input-field" type="number" value={securityAmountInput} onChange={e => setSecurityAmountInput(e.target.value)} placeholder="4-digit number" required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
                            <button type="submit" className="submit-button">Verify Identity</button>
                        </div>
                    </form>
                </>
                ) : verifiedUser && (
                <>
                    <h3>Set New Password</h3>
                    <p>Create a new password for user: <strong>{verifiedUser.username}</strong></p>
                    <form onSubmit={handleResetSubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="reset-new-password">New Password</label>
                            <input id="reset-new-password" className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="At least 6 characters" required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="reset-confirm-password">Confirm New Password</label>
                            <input id="reset-confirm-password" className="input-field" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
                            <button type="submit" className="submit-button">Set New Password</button>
                        </div>
                    </form>
                </>
                )}
            </div>
        </div>
    );
};

interface LoginFormProps {
    onToggleView: () => void;
    onLoginSuccess: (username: string, password?: string) => void;
    onPasswordReset: (userId: number, newPassword: string) => void;
    users: User[];
}

const LoginForm = ({ onToggleView, onLoginSuccess, users, onPasswordReset }: LoginFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
                onClick={() => setShowForgotPassword(true)}
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
      {showForgotPassword && <ForgotPasswordModal onClose={() => setShowForgotPassword(false)} users={users} onPasswordReset={onPasswordReset} />}
    </>
  );
};

interface RegisterFormProps {
    onToggleView: () => void;
    onRegisterSuccess: (username: string, password: string, securityAmount: number) => void;
}

const RegisterForm = ({ onToggleView, onRegisterSuccess }: RegisterFormProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityAmount, setSecurityAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    const amount = parseInt(securityAmount, 10);
    if (isNaN(amount) || securityAmount.length !== 4) {
        alert("Please enter a valid 4-digit security amount.");
        return;
    }
    onRegisterSuccess(username, password, amount);
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
        <div className="input-group">
          <label htmlFor="register-security-amount">Security Amount</label>
          <input id="register-security-amount" className="input-field" type="number" value={securityAmount} onChange={(e) => setSecurityAmount(e.target.value)} required aria-label="Security Amount for password recovery" placeholder="4-digit number for recovery" />
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