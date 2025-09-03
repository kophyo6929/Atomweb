import React, { useState, useEffect, useRef } from 'react';
import { User } from './types';
import { Logo } from './components';

const UserProfileDropdown: React.FC<{ user: User; onNavigate: (view: string) => void; onLogout: () => void; }> = ({ user, onNavigate, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleToggle = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        setIsOpen(false);
        onLogout();
    };

    const handleNavigateAdmin = () => {
        setIsOpen(false);
        onNavigate('ADMIN_PANEL');
    };

    const handleNavigateProfile = () => {
        setIsOpen(false);
        onNavigate('USER_PROFILE');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="user-profile-dropdown" ref={dropdownRef}>
            <button className={`user-profile-button ${isOpen ? 'open' : ''}`} onClick={handleToggle} aria-haspopup="true" aria-expanded={isOpen}>
                {user.username}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </button>
            {isOpen && (
                <ul className="dropdown-menu" role="menu">
                     <li role="presentation">
                        <button onClick={handleNavigateProfile} className="dropdown-item" role="menuitem">
                           My Profile
                        </button>
                    </li>
                    {user.isAdmin && (
                        <li role="presentation">
                            <button onClick={handleNavigateAdmin} className="dropdown-item" role="menuitem">
                                Admin Panel
                            </button>
                        </li>
                    )}
                     <li role="presentation">
                        <a href="https://t.me/ceo_metaverse" target="_blank" rel="noopener noreferrer" className="dropdown-item" role="menuitem">
                            Contact Admin
                        </a>
                    </li>
                    <li className="dropdown-divider" role="separator"></li>
                    <li role="presentation">
                        <button onClick={handleLogout} className="dropdown-item dropdown-item-logout" role="menuitem">
                            Logout
                        </button>
                    </li>
                </ul>
            )}
        </div>
    );
};


interface DashboardProps {
    user: User;
    onNavigate: (view: string) => void;
    onLogout: () => void;
}

const Dashboard = ({ user, onNavigate, onLogout }: DashboardProps) => {
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <Logo />
        <div className="header-actions">
            <UserProfileDropdown user={user} onNavigate={onNavigate} onLogout={onLogout} />
        </div>
      </header>
      <main className="dashboard-main">
        <h2>Welcome, {user.username}!</h2>
        <p className="balance">Your Credits: <span>{user.credits.toFixed(2)} C</span></p>
        <div className="action-cards">
          <div className="card" onClick={() => onNavigate('BROWSE_PRODUCTS')}>
            <h3>🛍️ Browse Products</h3>
            <p>View our catalog of digital goods.</p>
          </div>
          <div className="card" onClick={() => onNavigate('BUY_CREDITS')}>
            <h3>💰 Buy Credits</h3>
            <p>Top up your account balance.</p>
          </div>
          <div className="card" onClick={() => onNavigate('MY_ORDERS')}>
            <h3>📋 My Orders</h3>
            <p>Check your order history and status.</p>
          </div>
           <div className="card" onClick={() => onNavigate('FAQ')}>
            <h3>❓ FAQ</h3>
            <p>Find answers to common questions.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;