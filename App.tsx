import React, { useState, useEffect } from 'react';
import { initialProducts, initialUsers, initialOrders } from './data';
import { User } from './types';
import AuthPage from './Auth';
import Dashboard from './Dashboard';
import ProductFlow from './ProductFlow';
import BuyCreditsView from './BuyCreditsView';
import MyOrdersView from './MyOrdersView';
import AdminPanel from './AdminPanel';
import FAQView from './FAQView';

const App = () => {
  // State Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState('DASHBOARD');
  
  // Mock Database State
  const [products, setProducts] = useState(initialProducts);
  const [users, setUsers] = useState(initialUsers);
  const [orders, setOrders] = useState(initialOrders);

  // Update currentUser in real-time when users state changes
  useEffect(() => {
    if (currentUser) {
      const updatedUser = users.find(u => u.id === currentUser.id);
      setCurrentUser(updatedUser || null);
    }
  }, [users]);


  const handleLoginSuccess = (username: string, password?: string) => {
    // In a real app, never handle passwords on the client side like this.
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        setCurrentUser(user);
        setIsLoggedIn(true);
        setCurrentView('DASHBOARD');
    } else {
        alert("Invalid credentials!");
    }
  };

  const handleRegisterSuccess = (username: string) => {
    const newUser: User = { id: users.length + 1, username, password: 'password', isAdmin: false, credits: 0 };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    setIsLoggedIn(true);
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsLoggedIn(false);
  };
  
  const navigateTo = (view: string) => setCurrentView(view);

  // --- View Renderer --- //
  const renderView = () => {
    if (!currentUser) return null; // Should not happen if logged in
    switch (currentView) {
      case 'DASHBOARD':
        return <Dashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} />;
      case 'BROWSE_PRODUCTS':
        return <ProductFlow products={products} onNavigate={navigateTo} user={currentUser} setOrders={setOrders} orders={orders} setUsers={setUsers} users={users} />;
      case 'BUY_CREDITS':
        return <BuyCreditsView user={currentUser} onNavigate={navigateTo} setOrders={setOrders} orders={orders} />;
      case 'MY_ORDERS':
        return <MyOrdersView user={currentUser} onNavigate={navigateTo} orders={orders} />;
      case 'ADMIN_PANEL':
        return <AdminPanel onNavigate={navigateTo} products={products} setProducts={setProducts} users={users} setUsers={setUsers} orders={orders} setOrders={setOrders} />;
       case 'FAQ':
        return <FAQView onNavigate={navigateTo} />;
      default:
        return <Dashboard user={currentUser} onNavigate={navigateTo} onLogout={handleLogout} />;
    }
  };

  return (
    <>
      {isLoggedIn && currentUser ? (
        renderView()
      ) : (
        <AuthPage onLoginSuccess={handleLoginSuccess} onRegisterSuccess={handleRegisterSuccess} />
      )}
    </>
  );
};

export default App;
