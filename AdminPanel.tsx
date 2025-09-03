import React, { useState, useEffect } from 'react';
import { ProductsData, User, Order, ProductItem } from './types';
import { MMK_PER_CREDIT } from './utils';
import { Logo, CollapsibleSection } from './components';

// --- ADMIN PANEL --- //

interface AdminPanelProps {
    onNavigate: (view: string) => void;
    products: ProductsData;
    setProducts: React.Dispatch<React.SetStateAction<ProductsData>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const AdminPanel = ({ onNavigate, products, setProducts, users, setUsers, orders, setOrders }: AdminPanelProps) => {
    const [adminView, setAdminView] = useState('DASHBOARD');
    
    const renderAdminView = () => {
        switch (adminView) {
            case 'PRODUCTS':
                return <AdminManageProducts products={products} setProducts={setProducts} />;
            case 'USERS':
                return <AdminManageUsers users={users} setUsers={setUsers} />;
            case 'ORDERS':
                return <AdminViewAllOrders orders={orders} users={users} setOrders={setOrders} setUsers={setUsers} />;
            default:
                return (
                    <div className="action-cards">
                        <div className="card" onClick={() => setAdminView('PRODUCTS')}><h3>📦 Manage Products</h3></div>
                        <div className="card" onClick={() => setAdminView('USERS')}><h3>👤 Manage Users</h3></div>
                        <div className="card" onClick={() => setAdminView('ORDERS')}><h3>📊 View All Orders</h3></div>
                    </div>
                );
        }
    };

    return (
         <div className="admin-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">Exit Admin</button>
            </header>
            <main className="dashboard-main">
                 {adminView !== 'DASHBOARD' && <button onClick={() => setAdminView('DASHBOARD')} className="back-button mb-1">← Admin Dashboard</button>}
                 {renderAdminView()}
            </main>
        </div>
    );
};

// --- Sub-components for AdminPanel --- //

const AdminManageProducts = ({ products, setProducts }: { products: ProductsData, setProducts: React.Dispatch<React.SetStateAction<ProductsData>> }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null); // null for new, product object for editing

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: ProductItem) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = (product: ProductItem) => {
        if (!confirm(`Are you sure you want to delete product: ${product.name}?`)) return;
        if (!product.operator || !product.category) return;

        const newProducts = JSON.parse(JSON.stringify(products));
        const categoryProducts = newProducts[product.operator][product.category];
        const productIndex = categoryProducts.findIndex((p: ProductItem) => p.id === product.id);

        if (productIndex > -1) {
            categoryProducts.splice(productIndex, 1);
            setProducts(newProducts);
            alert('Product deleted.');
        }
    };

    const handleSave = (formData: any, originalProduct: ProductItem | null) => {
        const newProducts = JSON.parse(JSON.stringify(products));
        
        if (originalProduct && originalProduct.operator && originalProduct.category) {
            const oldCategoryList = newProducts[originalProduct.operator]?.[originalProduct.category];
            if(oldCategoryList) {
                const index = oldCategoryList.findIndex((p: ProductItem) => p.id === originalProduct.id);
                if (index > -1) oldCategoryList.splice(index, 1);
            }
        }
        
        const { operator, category, ...productDetails } = formData;
        
        if (!newProducts[operator]) newProducts[operator] = {};
        if (!newProducts[operator][category]) newProducts[operator][category] = [];
        
        newProducts[operator][category].push(productDetails);
        newProducts[operator][category].sort((a: ProductItem,b: ProductItem) => a.name.localeCompare(b.name));
        
        setProducts(newProducts);
    };
    
    return (
        <div>
            <div className="admin-header">
                <h2>Manage Products</h2>
                <button onClick={handleAddNew} className="button-add">+ Add New Product</button>
            </div>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead><tr><th>Operator</th><th>Category</th><th>Name</th><th>ID</th><th>Price (MMK)</th><th>Actions</th></tr></thead>
                    <tbody>
                        {Object.entries(products).flatMap(([operator, categories]) => 
                            Object.entries(categories).flatMap(([category, productList]) => 
                                productList.map(p => {
                                    const fullProduct = { ...p, operator, category };
                                    return (
                                        <tr key={p.id}>
                                            <td>{operator}</td>
                                            <td>{category}</td>
                                            <td>{p.name}</td>
                                            <td>{p.id}</td>
                                            <td>{p.price_mmk.toLocaleString()}</td>
                                            <td className="admin-actions">
                                                <button onClick={() => handleEdit(fullProduct)} className="button-secondary">Edit</button>
                                                <button onClick={() => handleDelete(fullProduct)} className="button-danger">Delete</button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )
                        )}
                    </tbody>
                </table>
            </div>
            <ProductEditModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                product={editingProduct}
                allProducts={products}
            />
        </div>
    );
};

const ProductEditModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (formData: any, originalProduct: ProductItem | null) => void;
    product: ProductItem | null;
    allProducts: ProductsData;
}> = ({ isOpen, onClose, onSave, product, allProducts }) => {
    const isNew = product === null;
    const [formData, setFormData] = useState({
        operator: '', category: '', id: '', name: '', price_mmk: '', extra: '',
    });

    useEffect(() => {
        setFormData({
            operator: product?.operator || Object.keys(allProducts)[0] || '',
            category: product?.category || '',
            id: product?.id || `prod_${Date.now()}`,
            name: product?.name || '',
            price_mmk: String(product?.price_mmk ?? ''),
            extra: product?.extra || '',
        });
    }, [isOpen, product, allProducts]);

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const price = parseFloat(formData.price_mmk);
        if (isNaN(price) || price < 0) { alert('Please enter a valid price.'); return; }
        if (!formData.name || !formData.id || !formData.operator || !formData.category) { alert('Please fill in all required fields.'); return; }
        onSave({ ...formData, price_mmk: price }, product);
        onClose();
    };

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3>{isNew ? 'Add New Product' : 'Edit Product'}</h3>
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <label htmlFor="operator">Operator</label>
                        <input id="operator" name="operator" type="text" value={formData.operator} onChange={handleChange} className="input-field" placeholder="e.g., ATOM" required />
                    </div>
                     <div className="input-group">
                        <label htmlFor="category">Category</label>
                        <input id="category" name="category" type="text" value={formData.category} onChange={handleChange} className="input-field" placeholder="e.g., Data" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="name">Product Name</label>
                        <input id="name" name="name" type="text" value={formData.name} onChange={handleChange} className="input-field" required />
                    </div>
                     <div className="input-group">
                        <label htmlFor="price_mmk">Price (MMK)</label>
                        <input id="price_mmk" name="price_mmk" type="number" value={formData.price_mmk} onChange={handleChange} className="input-field" required />
                    </div>
                    <div className="input-group">
                        <label htmlFor="extra">Extra Info (Optional)</label>
                        <input id="extra" name="extra" type="text" value={formData.extra} onChange={handleChange} className="input-field" />
                    </div>
                     <div className="input-group">
                        <label htmlFor="id">Product ID</label>
                        <input id="id" name="id" type="text" value={formData.id} onChange={handleChange} className="input-field" required disabled={!isNew} />
                    </div>
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="button-secondary">Cancel</button>
                        <button type="submit" className="submit-button">Save Product</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const AdminManageUsers: React.FC<{ users: User[], setUsers: React.Dispatch<React.SetStateAction<User[]>> }> = ({ users, setUsers }) => {
    const adjustCredits = (userId: number, currentCredits: number) => {
        const amountStr = prompt(`Adjust credits for user ${userId}.\nCurrent: ${currentCredits.toFixed(2)}\nEnter amount to add (e.g., 50 or -10):`);
        if (amountStr === null) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount)) { alert('Invalid amount.'); return; }
        setUsers(prevUsers => prevUsers.map(u => u.id === userId ? { ...u, credits: u.credits + amount } : u));
        alert('Credits updated.');
    };

    return (
        <div>
            <h2>Manage Users</h2>
            <div className="admin-table-container">
                <table className="admin-table">
                     <thead><tr><th>ID</th><th>Username</th><th>Admin?</th><th>Credits</th><th>Actions</th></tr></thead>
                     <tbody>
                        {users.map(u => (
                            <tr key={u.id}>
                                <td>{u.id}</td>
                                <td>{u.username}</td>
                                <td>{u.isAdmin ? 'Yes' : 'No'}</td>
                                <td>{u.credits.toFixed(2)}</td>
                                <td><button onClick={() => adjustCredits(u.id, u.credits)} className="button-secondary">Adjust Credits</button></td>
                            </tr>
                        ))}
                     </tbody>
                </table>
            </div>
        </div>
    );
};

const AdminViewAllOrders: React.FC<{
    orders: Order[];
    users: User[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}> = ({ orders, users, setOrders, setUsers }) => {
    const [viewingProof, setViewingProof] = useState<string | null>(null);

    const handleApproval = (orderToApprove: Order) => {
        const user = users.find(u => u.id === orderToApprove.userId);
        if (!user) { alert("User not found for this order."); return; }

        if (orderToApprove.type === 'CREDIT') {
            const creditsToAdd = parseFloat(orderToApprove.cost.toString()) / MMK_PER_CREDIT;
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, credits: u.credits + creditsToAdd } : u));
            alert(`Approved credit purchase. ${creditsToAdd.toFixed(2)} credits added to ${user.username}.`);
        } else {
            alert(`Approved product purchase for ${user.username}.`);
        }
        setOrders(prev => prev.map(o => o.id === orderToApprove.id ? { ...o, status: 'Completed' } : o));
    };

    const handleDecline = (orderToDecline: Order) => {
        if (orderToDecline.id.startsWith('PROD')) {
            const user = users.find(u => u.id === orderToDecline.userId);
            if (user) {
                const costToRefund = parseFloat(orderToDecline.cost.toString());
                setUsers(prev => prev.map(u => u.id === user.id ? { ...u, credits: u.credits + costToRefund } : u));
                alert(`Order ${orderToDecline.id} declined. ${costToRefund.toFixed(2)} C refunded to ${user.username}.`);
            }
        } else {
             alert(`Payment request ${orderToDecline.id} has been declined.`);
        }
        setOrders(prev => prev.map(o => o.id === orderToDecline.id ? { ...o, status: 'Declined' } : o));
    };

    const sortRecentFirst = (a: Order, b: Order) => new Date(b.date).getTime() - new Date(a.date).getTime();
    const pendingProductOrders = orders.filter(o => !o.type && o.status === 'Pending Approval').sort(sortRecentFirst);
    const pendingPaymentRequests = orders.filter(o => o.type === 'CREDIT' && o.status === 'Pending Approval').sort(sortRecentFirst);
    const approvedProductOrders = orders.filter(o => !o.type && o.status === 'Completed').sort(sortRecentFirst);
    const declinedProductOrders = orders.filter(o => !o.type && o.status === 'Declined').sort(sortRecentFirst);
    const approvedPaymentRequests = orders.filter(o => o.type === 'CREDIT' && o.status === 'Completed').sort(sortRecentFirst);
    const declinedPaymentRequests = orders.filter(o => o.type === 'CREDIT' && o.status === 'Declined').sort(sortRecentFirst);
    
    const renderProductOrderTable = (orderList: Order[]) => (
         <div className="admin-table-container">
            <table className="admin-table">
                <thead><tr><th>Order ID</th><th>User</th><th>Product</th><th>Cost (C)</th><th>Deliver To</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                    {orderList.map(o => {
                        const user = users.find(u => u.id === o.userId);
                        return (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{user ? user.username : 'Unknown'} ({o.userId})</td>
                                <td>{o.product.name}</td>
                                <td>{o.cost.toFixed(2)} C</td>
                                <td>{o.deliveryInfo}</td>
                                <td><span className={`status-badge status-${o.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{o.status}</span></td>
                                <td>{new Date(o.date).toLocaleString()}</td>
                                {o.status === 'Pending Approval' && <td className="admin-actions"><button onClick={() => handleApproval(o)} className="button-success">Approve</button><button onClick={() => handleDecline(o)} className="button-danger">Decline</button></td>}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
    
    const renderPaymentRequestTable = (paymentList: Order[]) => (
         <div className="admin-table-container">
            <table className="admin-table">
                <thead><tr><th>Order ID</th><th>User</th><th>Amount (MMK)</th><th>Method</th><th>Proof</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
                <tbody>
                    {paymentList.map(o => {
                        const user = users.find(u => u.id === o.userId);
                        return (
                            <tr key={o.id}>
                                <td>{o.id}</td>
                                <td>{user ? user.username : 'Unknown'} ({o.userId})</td>
                                <td>{o.cost.toLocaleString()} MMK</td>
                                <td>{o.paymentMethod}</td>
                                <td>{o.paymentProof ? <button className="button-view-proof" onClick={() => setViewingProof(o.paymentProof as string)}>View</button> : 'N/A'}</td>
                                <td><span className={`status-badge status-${o.status.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}>{o.status}</span></td>
                                <td>{new Date(o.date).toLocaleString()}</td>
                                 {o.status === 'Pending Approval' && <td className="admin-actions"><button onClick={() => handleApproval(o)} className="button-success">Approve</button><button onClick={() => handleDecline(o)} className="button-danger">Decline</button></td>}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="admin-order-view">
            <h2>All User Orders</h2>
            <CollapsibleSection title={`Pending Product Orders (${pendingProductOrders.length})`} startOpen={true}>{pendingProductOrders.length > 0 ? renderProductOrderTable(pendingProductOrders) : <p>No pending product orders.</p>}</CollapsibleSection>
            <CollapsibleSection title={`Pending Payment Requests (${pendingPaymentRequests.length})`} startOpen={true}>{pendingPaymentRequests.length > 0 ? renderPaymentRequestTable(pendingPaymentRequests) : <p>No pending payment requests.</p>}</CollapsibleSection>
            <CollapsibleSection title={`Approved Product Orders (${approvedProductOrders.length})`}>{approvedProductOrders.length > 0 ? renderProductOrderTable(approvedProductOrders) : <p>No approved product orders.</p>}</CollapsibleSection>
            <CollapsibleSection title={`Declined Product Orders (${declinedProductOrders.length})`}>{declinedProductOrders.length > 0 ? renderProductOrderTable(declinedProductOrders) : <p>No declined product orders.</p>}</CollapsibleSection>
            <CollapsibleSection title={`Approved Payment Requests (${approvedPaymentRequests.length})`}>{approvedPaymentRequests.length > 0 ? renderPaymentRequestTable(approvedPaymentRequests) : <p>No approved payment requests.</p>}</CollapsibleSection>
            <CollapsibleSection title={`Declined Payment Requests (${declinedPaymentRequests.length})`}>{declinedPaymentRequests.length > 0 ? renderPaymentRequestTable(declinedPaymentRequests) : <p>No declined payment requests.</p>}</CollapsibleSection>
            {viewingProof && <div className="modal-backdrop" onClick={() => setViewingProof(null)}><div className="modal-content proof-modal" onClick={e => e.stopPropagation()}><img src={viewingProof} alt="Payment Proof" /><button onClick={() => setViewingProof(null)} className="submit-button">Close</button></div></div>}
        </div>
    );
};

export default AdminPanel;
