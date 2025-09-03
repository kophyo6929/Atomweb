import React, { useState } from 'react';
import { Logo } from './components';
import { User } from './types';
import { useLanguage } from './i18n';

// --- AUTHENTICATION COMPONENTS --- //

const TelegramIcon = () => (
    <svg viewBox="0 0 24 24" fill="currentColor" height="1em" width="1em">
        <path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.17.91-.494 1.208-.822 1.23-.696.047-1.225-.46-1.9- .902-1.018-.65-1.58-1.027-2.597-1.677-.945-.608-.34-.942.235-1.505.14-.135.253-.252.36-.363.632-.638 1.267-1.278 1.13-1.333-.136-.055-.465.137-.67.27-.43.27-1.023.636-1.53.921-.57.317-.99.46-1.29.432-.46-.054-1.09-.2-1.64-.365-1.02-.31-1.83-.485-1.74-.973.03-.19.31-.38.76-.571 2.25-1.001 3.81-1.754 4.82-2.26 1.7-.84 2.12-1.01 2.37-1.011z" />
    </svg>
);


interface AuthProps {
    onLoginSuccess: (username: string, password?: string) => void;
    onRegisterSuccess: (username: string, password: string, securityAmount: number) => void;
    onPasswordReset: (userId: number, newPassword: string) => void;
    users: User[];
    adminContact: string;
}

const AuthPage = ({ onLoginSuccess, onRegisterSuccess, onPasswordReset, users, adminContact }: AuthProps) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const { t } = useLanguage();
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
        <a href={adminContact} target="_blank" rel="noopener noreferrer" className="contact-admin-link">
            <TelegramIcon />
            <span>{t('auth.contactAdmin')}</span>
        </a>
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
    const { t } = useLanguage();
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
            alert(t('auth.forgotPasswordModal.alerts.invalidInput'));
            return;
        }

        const user = users.find(u => u.id === id);

        if (user && user.securityAmount === amount) {
            setVerifiedUser(user);
            setStep('reset');
        } else {
            alert(t('auth.forgotPasswordModal.alerts.invalidCredentials'));
        }
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifiedUser) return;

        if (!newPassword || newPassword.length < 6) {
             alert(t('auth.resetPasswordModal.alerts.passwordTooShort'));
             return;
        }

        if (newPassword !== confirmPassword) {
            alert(t('auth.resetPasswordModal.alerts.passwordsDontMatch'));
            return;
        }
        
        onPasswordReset(verifiedUser.id, newPassword);
        alert(t('auth.resetPasswordModal.alerts.passwordResetSuccess', { username: verifiedUser.username }));
        onClose();
    };


    return (
        <div className="modal-backdrop">
            <div className="modal-content">
                {step === 'verify' ? (
                <>
                    <h3>{t('auth.forgotPasswordModal.title')}</h3>
                    <p>{t('auth.forgotPasswordModal.description')}</p>
                    <form onSubmit={handleVerifySubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="recovery-userid">{t('auth.forgotPasswordModal.userIdLabel')}</label>
                            <input id="recovery-userid" className="input-field" type="number" value={userIdInput} onChange={e => setUserIdInput(e.target.value)} placeholder={t('auth.forgotPasswordModal.userIdPlaceholder')} required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="recovery-amount">{t('auth.forgotPasswordModal.securityAmountLabel')}</label>
                            <input id="recovery-amount" className="input-field" type="number" value={securityAmountInput} onChange={e => setSecurityAmountInput(e.target.value)} placeholder={t('auth.forgotPasswordModal.securityAmountPlaceholder')} required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="button-secondary">{t('common.cancel')}</button>
                            <button type="submit" className="submit-button">{t('auth.forgotPasswordModal.verifyButton')}</button>
                        </div>
                    </form>
                </>
                ) : verifiedUser && (
                <>
                    <h3>{t('auth.resetPasswordModal.title')}</h3>
                    <p>{t('auth.resetPasswordModal.description', { username: verifiedUser.username })}</p>
                    <form onSubmit={handleResetSubmit} className="auth-form">
                        <div className="input-group">
                            <label htmlFor="reset-new-password">{t('auth.resetPasswordModal.newPasswordLabel')}</label>
                            <input id="reset-new-password" className="input-field" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder={t('auth.resetPasswordModal.newPasswordPlaceholder')} required />
                        </div>
                         <div className="input-group">
                            <label htmlFor="reset-confirm-password">{t('auth.resetPasswordModal.confirmPasswordLabel')}</label>
                            <input id="reset-confirm-password" className="input-field" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </div>
                        <div className="modal-actions">
                            <button type="button" onClick={onClose} className="button-secondary">{t('common.cancel')}</button>
                            <button type="submit" className="submit-button">{t('auth.resetPasswordModal.setNewPasswordButton')}</button>
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
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess(username, password);
  };

  return (
    <>
      <h1>{t('auth.signInTitle')}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
         <div className="input-group">
          <label htmlFor="login-username">{t('auth.usernameLabel')}</label>
          <input id="login-username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-label={t('auth.usernameLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="login-password">{t('auth.passwordLabel')}</label>
          <input id="login-password" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label={t('auth.passwordLabel')} />
        </div>
        <div className="forgot-password-container">
            <button
                type="button"
                className="forgot-password-link"
                onClick={() => setShowForgotPassword(true)}
            >
                {t('auth.forgotPasswordLink')}
            </button>
        </div>
        <button type="submit" className="submit-button">{t('auth.loginButton')}</button>
      </form>
      <div className="toggle-form-container">
        <span>{t('auth.registerPrompt')} </span>
        <button onClick={onToggleView} className="toggle-form-link" aria-label="Switch to registration form">{t('auth.registerLink')}</button>
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
  const { t } = useLanguage();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securityAmount, setSecurityAmount] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert(t('auth.resetPasswordModal.alerts.passwordsDontMatch'));
      return;
    }
    const amount = parseInt(securityAmount, 10);
    if (isNaN(amount) || securityAmount.length !== 4) {
        alert(t('auth.forgotPasswordModal.alerts.invalidInput')); // Re-using a similar alert
        return;
    }
    onRegisterSuccess(username, password, amount);
  };

  return (
    <>
      <h1>{t('auth.createAccountTitle')}</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="register-username">{t('auth.usernameLabel')}</label>
          <input id="register-username" className="input-field" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required aria-label={t('auth.usernameLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="register-password">{t('auth.passwordLabel')}</label>
          <input id="register-password" className="input-field" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required aria-label={t('auth.passwordLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="register-confirm-password">{t('auth.confirmPasswordLabel')}</label>
          <input id="register-confirm-password" className="input-field" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required aria-label={t('auth.confirmPasswordLabel')} />
        </div>
        <div className="input-group">
          <label htmlFor="register-security-amount">{t('auth.securityAmountLabel')}</label>
          <input id="register-security-amount" className="input-field" type="number" value={securityAmount} onChange={(e) => setSecurityAmount(e.target.value)} required aria-label={t('auth.securityAmountLabel')} placeholder={t('auth.securityAmountPlaceholder')} />
        </div>
        <button type="submit" className="submit-button">{t('auth.registerButton')}</button>
      </form>
      <div className="toggle-form-container">
        <span>{t('auth.loginPrompt')} </span>
        <button onClick={onToggleView} className="toggle-form-link" aria-label="Switch to login form">{t('auth.loginLink')}</button>
      </div>
    </>
  );
};

export default AuthPage;