import React, { useState } from 'react';
import { User, Order } from './types';
import { Logo } from './components';

interface MyOrdersViewProps {
    user: User;
    orders: Order[];
    onNavigate: (view: string) => void;
}

const MyOrdersView = ({ user, orders, onNavigate }: MyOrdersViewProps) => {
    const [statusFilter, setStatusFilter] = useState('All');
    const filterOptions = ['All', 'Pending Approval', 'Completed', 'Declined'];
    
    const filteredOrders = orders
        .filter(o => o.userId === user.id)
        .filter(o => statusFilter === 'All' || o.status === statusFilter)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">Back to Dashboard</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                   <button onClick={() => onNavigate('DASHBOARD')} className="back-button">← Back</button>
                    <h3>My Order History</h3>
                </div>
                <div className="order-filters">
                    {filterOptions.map(opt => (
                        <button 
                            key={opt}
                            className={`filter-btn ${statusFilter === opt ? 'active' : ''}`}
                            onClick={() => setStatusFilter(opt)}
                        >
                            {opt.replace(' Approval', '')}
                        </button>
                    ))}
                </div>
                <div className="order-list">
                    {filteredOrders.length > 0 ? filteredOrders.map(o => (
                        <div key={o.id} className="order-item">
                            <div className="order-info">
                                <h4>{o.product.name}</h4>
                                <p>Order ID: {o.id}</p>
                                <p>Date: {new Date(o.date).toLocaleString()}</p>
                                {o.deliveryInfo && <p>Delivered to: {o.deliveryInfo}</p>}
                                {o.paymentMethod && <p>Payment via: {o.paymentMethod}</p>}
                            </div>
                            <div className="order-details">
                                <span className={`status-badge status-${o.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{o.status}</span>
                                <p className="order-cost">
                                    {o.id.startsWith('PROD') ? `${o.cost.toFixed(2)} C` : `${o.cost.toLocaleString()} MMK`}
                                </p>
                            </div>
                        </div>
                    )) : <p>You have no orders matching this filter.</p>}
                </div>
            </main>
        </div>
    );
};

export default MyOrdersView;
