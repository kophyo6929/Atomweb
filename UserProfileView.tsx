import React from 'react';
import { User, Order } from './types';
import { Logo } from './components';

interface UserProfileViewProps {
    user: User;
    orders: Order[];
    onNavigate: (view: string) => void;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, orders, onNavigate }) => {
    const userOrders = orders.filter(o => o.userId === user.id);
    const pendingProductOrders = userOrders.filter(o => o.status === 'Pending Approval' && !o.type).length;
    const pendingPayments = userOrders.filter(o => o.status === 'Pending Approval' && o.type === 'CREDIT').length;

    return (
        <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">Back to Dashboard</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                   <button onClick={() => onNavigate('DASHBOARD')} className="back-button">← Back</button>
                    <h3>My Profile</h3>
                </div>
                <div className="profile-container">
                    <div className="profile-main-info">
                        <h2>{user.username}</h2>
                        <p>User ID: <span>{user.id}</span></p>
                    </div>

                    <div className="profile-balance-card">
                         <p>Current Balance</p>
                         <h3>{user.credits.toFixed(2)} C</h3>
                    </div>

                    <div className="profile-pending-section">
                        <h3>Pending Activity</h3>
                        <div className="pending-items">
                            <div className="pending-item">
                                <p>Product Orders</p>
                                <span>{pendingProductOrders}</span>
                            </div>
                            <div className="pending-item">
                                <p>Credit Payments</p>
                                <span>{pendingPayments}</span>
                            </div>
                        </div>
                        <button onClick={() => onNavigate('MY_ORDERS')} className="button-secondary" style={{width: '100%'}}>View All My Orders</button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserProfileView;
