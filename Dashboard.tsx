import React from 'react';
import { User } from './types';
import { Logo } from './components';

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
            <a href="https://t.me/ceo_metaverse" target="_blank" rel="noopener noreferrer" className="contact-admin-button">Contact Admin</a>
            {user.isAdmin && <button onClick={() => onNavigate('ADMIN_PANEL')} className="admin-panel-button">Admin Panel</button>}
            <button onClick={onLogout} className="logout-button">Logout</button>
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
