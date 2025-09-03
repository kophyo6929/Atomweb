import React, { useState } from 'react';
import { faqData } from './data';
import { Logo } from './components';

interface FAQViewProps {
    onNavigate: (view: string) => void;
}

const FAQView = ({ onNavigate }: FAQViewProps) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };
    
    return (
        <div className="generic-view-container">
            <header className="dashboard-header">
                <Logo />
                <button onClick={() => onNavigate('DASHBOARD')} className="logout-button">Back to Dashboard</button>
            </header>
            <main className="dashboard-main">
                 <div className="nav-header">
                   <button onClick={() => onNavigate('DASHBOARD')} className="back-button">← Back</button>
                    <h3>Frequently Asked Questions</h3>
                </div>
                <div className="faq-list">
                    {faqData.map((item, index) => (
                        <div key={index} className="faq-item">
                            <div 
                                className={`faq-question ${openIndex === index ? 'open' : ''}`}
                                onClick={() => toggleFAQ(index)}
                                role="button"
                                tabIndex={0}
                                aria-expanded={openIndex === index}
                                onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && toggleFAQ(index)}
                            >
                                <span>{item.q}</span>
                                <span className="indicator">+</span>
                            </div>
                            <div className={`faq-answer ${openIndex === index ? 'open' : ''}`}>
                                <p>{item.a}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default FAQView;
