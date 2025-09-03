import React, { useState } from 'react';
import { ProductsData, ProductItem, User, Order } from './types';
import { calculateCreditCost } from './utils';
import { Logo } from './components';

// --- PRODUCT BROWSE & PURCHASE FLOW --- //

interface ProductFlowProps {
    products: ProductsData;
    onNavigate: (view: string) => void;
    user: User;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
    users: User[];
    setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const ProductFlow = ({ products, onNavigate, user, setOrders, orders, setUsers }: ProductFlowProps) => {
    const [step, setStep] = useState('OPERATOR'); // OPERATOR, CATEGORY, LIST
    const [selectedOperator, setSelectedOperator] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const selectOperator = (operator: string) => {
        setSelectedOperator(operator);
        setStep('CATEGORY');
    };

    const selectCategory = (category: string) => {
        setSelectedCategory(category);
        setStep('LIST');
    };
    
    const goBack = () => {
        if (step === 'LIST') setStep('CATEGORY');
        else if (step === 'CATEGORY') {
            setStep('OPERATOR');
            setSelectedOperator(null);
        }
        else onNavigate('DASHBOARD');
    };
    
    const handlePurchase = (product: ProductItem, deliveryInfo: string) => {
        if (!selectedOperator) return;
        const cost = calculateCreditCost(product.price_mmk);

        if (user.credits < cost) {
            alert("You do not have enough credits for this purchase.");
            return;
        }

        // Deduct credits immediately
        setUsers(prevUsers =>
            prevUsers.map(u => (u.id === user.id ? { ...u, credits: u.credits - cost } : u))
        );

        const newOrder: Order = {
            id: `PROD-${Date.now()}`,
            userId: user.id,
            product: { name: product.name, operator: selectedOperator },
            cost: cost,
            status: 'Pending Approval',
            date: new Date().toISOString(),
            deliveryInfo,
        };
        setOrders([...orders, newOrder]);
        
        alert(`Your order for ${product.name} has been submitted. ${cost.toFixed(2)} C have been deducted and will be refunded if the order is declined.`);
        onNavigate('DASHBOARD');
    };

    return (
        <div className="product-flow-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">Back to Dashboard</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                    <button onClick={goBack} className="back-button">← Back</button>
                    <h3>{step === 'OPERATOR' ? 'Select Operator' : step === 'CATEGORY' ? `Operator: ${selectedOperator}` : `Category: ${selectedCategory}`}</h3>
                </div>
                {step === 'OPERATOR' && <OperatorList operators={Object.keys(products)} onSelect={selectOperator} />}
                {step === 'CATEGORY' && selectedOperator && <CategoryList categories={Object.keys(products[selectedOperator])} onSelect={selectCategory} />}
                {step === 'LIST' && selectedOperator && selectedCategory && <ProductList products={products[selectedOperator][selectedCategory]} onPurchase={handlePurchase} user={user} />}
            </main>
        </div>
    );
};

// --- Sub-components for ProductFlow --- //

const OperatorList: React.FC<{ operators: string[], onSelect: (op: string) => void }> = ({ operators, onSelect }) => (
    <div className="selection-grid">
        {operators.map(op => <div key={op} className="card" onClick={() => onSelect(op)}><h3>{op}</h3></div>)}
    </div>
);

const CategoryList: React.FC<{ categories: string[], onSelect: (cat: string) => void }> = ({ categories, onSelect }) => (
    <div className="selection-grid">
        {categories.map(cat => <div key={cat} className="card" onClick={() => onSelect(cat)}><h3>{cat}</h3></div>)}
    </div>
);

interface ProductListProps {
    products: ProductItem[];
    onPurchase: (product: ProductItem, deliveryInfo: string) => void;
    user: User;
}

const ProductList = ({ products, onPurchase, user }: ProductListProps) => {
    const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
    const [phone, setPhone] = useState('');
    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const handleBuyClick = (product: ProductItem) => {
        setSelectedProduct(product);
        setShowPhoneModal(true);
    };

    const handleProceedToConfirm = () => {
        if (!phone.match(/^[0-9]{7,11}$/)) {
            alert('Please enter a valid phone number.');
            return;
        }
        setShowPhoneModal(false);
        setShowConfirmModal(true);
    };
    
    const handleConfirmPurchase = () => {
        if (selectedProduct) {
            onPurchase(selectedProduct, phone);
        }
        closeModals();
    };

    const closeModals = () => {
        setShowPhoneModal(false);
        setShowConfirmModal(false);
        setSelectedProduct(null);
        setPhone('');
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <input 
                type="text"
                placeholder="Search products in this category..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="product-list">
                {filteredProducts.length > 0 ? filteredProducts.map(p => (
                    <div key={p.id} className="product-item">
                        <div className="product-info">
                            <h4>{p.name}</h4>
                            {p.extra && <p className="product-extra">{p.extra}</p>}
                            <p>{p.price_mmk.toLocaleString()} MMK / {calculateCreditCost(p.price_mmk).toFixed(2)} C</p>
                        </div>
                        <button onClick={() => handleBuyClick(p)} className="buy-button">Buy</button>
                    </div>
                )) : <p>No products found matching your search.</p>}
            </div>

            {showPhoneModal && selectedProduct && (
                 <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Delivery Information</h3>
                        <p>Please enter the phone number to deliver <strong>{selectedProduct.name}</strong> to.</p>
                        <div className="input-group">
                            <label htmlFor="phone">Phone Number</label>
                            <input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input-field" placeholder="e.g., 09xxxxxxxxx" />
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModals} className="button-secondary">Cancel</button>
                            <button onClick={handleProceedToConfirm} className="submit-button">Proceed</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showConfirmModal && selectedProduct && (
                 <div className="modal-backdrop">
                    <div className="modal-content">
                        <h3>Confirm Your Purchase</h3>
                        <div className="confirmation-summary">
                            <p><span>Product:</span> <strong>{selectedProduct.name}</strong></p>
                            <p><span>Deliver to:</span> <strong>{phone}</strong></p>
                            <p><span>Cost:</span> <strong className="yellow-text">{calculateCreditCost(selectedProduct.price_mmk).toFixed(2)} C</strong></p>
                            <hr />
                            <p><span>Your Balance:</span> {user.credits.toFixed(2)} C</p>
                            <p><span>Balance After:</span> <strong className="yellow-text">{(user.credits - calculateCreditCost(selectedProduct.price_mmk)).toFixed(2)} C</strong></p>
                        </div>
                        <div className="modal-actions">
                            <button onClick={closeModals} className="button-secondary">Cancel</button>
                            <button onClick={handleConfirmPurchase} className="submit-button">Confirm Purchase</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductFlow;
