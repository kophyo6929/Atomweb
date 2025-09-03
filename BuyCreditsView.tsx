import React, { useState } from 'react';
import { User, Order } from './types';
import { paymentAccountDetails } from './data';
import { MMK_PER_CREDIT } from './utils';
import { Logo } from './components';

interface BuyCreditsViewProps {
    user: User;
    onNavigate: (view: string) => void;
    orders: Order[];
    setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

const BuyCreditsView = ({ user, onNavigate, setOrders, orders }: BuyCreditsViewProps) => {
    const [step, setStep] = useState(1); // 1: amount, 2: method, 3: upload
    const [amountMMK, setAmountMMK] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(''); // 'KPay' or 'Wave Pay'
    const [paymentProof, setPaymentProof] = useState<string | null>(null); // base64 string
    const [paymentProofPreview, setPaymentProofPreview] = useState<string | null>(null); // object URL for preview

    const creditPackages = [10, 30, 50, 100];

    const handlePackageSelect = (creditAmount: number) => {
        setAmountMMK((creditAmount * MMK_PER_CREDIT).toString());
        setStep(2);
    };

    const handleAmountSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (parseFloat(amountMMK) > 0) {
            setStep(2);
        } else {
            alert('Please enter a valid amount.');
        }
    };

    const selectPaymentMethod = (method: string) => {
        setPaymentMethod(method);
        setStep(3);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPaymentProof(reader.result as string);
            };
            reader.readAsDataURL(file);
            setPaymentProofPreview(URL.createObjectURL(file));
        } else {
            setPaymentProof(null);
            setPaymentProofPreview(null);
        }
    };
    
    const handleSubmitRequest = () => {
        if (!paymentProof) {
            alert('Please upload a payment proof screenshot.');
            return;
        }
        const creditAmount = parseFloat(amountMMK) / MMK_PER_CREDIT;
        const newOrder: Order = {
            id: `CRD-${Date.now()}`,
            userId: user.id,
            type: 'CREDIT',
            product: { name: `${creditAmount.toFixed(2)} Credits Purchase` },
            cost: parseFloat(amountMMK), // Cost is in MMK
            paymentMethod: paymentMethod,
            paymentProof: paymentProof,
            status: 'Pending Approval',
            date: new Date().toISOString(),
        };
        setOrders(prev => [...prev, newOrder]);
        alert('Your payment request has been submitted for approval.');
        onNavigate('MY_ORDERS');
    };

    const goBack = () => {
        if (step > 1) {
            setStep(step - 1);
        } else {
            onNavigate('DASHBOARD');
        }
    };

    const renderStep = () => {
        switch(step) {
            case 1:
                return (
                     <div className="buy-credits-flow">
                        <h3>Step 1: Choose Amount</h3>
                        
                        <div className="credit-packages">
                            <h4>Quick Buy</h4>
                            <div className="package-buttons">
                                {creditPackages.map(credits => (
                                    <button key={credits} className="package-btn" onClick={() => handlePackageSelect(credits)}>
                                        <span className="package-credits">{credits} C</span>
                                        <span className="package-price">{(credits * MMK_PER_CREDIT).toLocaleString()} MMK</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="or-divider">
                            <span>OR</span>
                        </div>
                        
                        <form onSubmit={handleAmountSubmit}>
                            <h4>Enter Custom Amount</h4>
                            <div className="input-group">
                                <label htmlFor="custom-mmk">Amount (MMK)</label>
                                <input 
                                    id="custom-mmk" 
                                    type="number" 
                                    value={amountMMK} 
                                    onChange={e => setAmountMMK(e.target.value)} 
                                    className="input-field" 
                                    placeholder="e.g., 5000" 
                                />
                            </div>
                            <div className="credit-equivalent">
                                You will get: <span>{(amountMMK ? parseFloat(amountMMK) / MMK_PER_CREDIT : 0).toFixed(2)} C</span>
                            </div>
                            <button type="submit" className="submit-button" disabled={!amountMMK || parseFloat(amountMMK) <= 0}>
                                Next →
                            </button>
                        </form>
                    </div>
                );
            case 2:
                return (
                    <div className="buy-credits-flow">
                        <h3>Step 2: Select Payment Method</h3>
                        <p>You are purchasing for <strong>{parseFloat(amountMMK).toLocaleString()} MMK</strong>.</p>
                        <div className="payment-methods">
                            <button className="payment-method-btn" onClick={() => selectPaymentMethod('KPay')}>KPay</button>
                            <button className="payment-method-btn" onClick={() => selectPaymentMethod('Wave Pay')}>Wave Pay</button>
                        </div>
                    </div>
                );
            case 3:
                 const account = paymentAccountDetails[paymentMethod];
                return (
                    <div className="buy-credits-flow">
                        <h3>Step 3: Upload Payment Proof</h3>
                        <div className="payment-instructions">
                            <p>Please transfer <strong>{parseFloat(amountMMK).toLocaleString()} MMK</strong> to the following {paymentMethod} account:</p>
                            <div className="account-details">
                                <p><span>Name:</span> <strong>{account.name}</strong></p>
                                <p><span>Number:</span> <strong className="account-number">{account.number}</strong></p>
                            </div>
                            <p className="upload-instruction">After payment, please upload the screenshot of your payment proof to this website.</p>
                        </div>
                        <div className="upload-area">
                            <label htmlFor="file-upload" className="custom-file-upload">
                                {paymentProofPreview ? 'Change Screenshot' : 'Choose Screenshot'}
                            </label>
                            <input id="file-upload" type="file" accept="image/*" onChange={handleFileChange} />
                            {paymentProofPreview && (
                                <div className="image-preview">
                                    <img src={paymentProofPreview} alt="Payment proof preview" />
                                </div>
                            )}
                        </div>
                        <button onClick={handleSubmitRequest} className="submit-button" disabled={!paymentProof}>
                            Submit Request
                        </button>
                    </div>
                );
            default: return null;
        }
    }

    return (
         <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">Back to Dashboard</button>
            </header>
            <main className="dashboard-main">
                <div className="nav-header">
                   <button onClick={goBack} className="back-button">← Back</button>
                    <h3>Buy Credits</h3>
                </div>
                {renderStep()}
            </main>
        </div>
    );
};

export default BuyCreditsView;
