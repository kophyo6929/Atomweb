import React, { createContext, useState, useContext, ReactNode, FC, useEffect } from 'react';

type Language = 'en' | 'my';

interface LanguageContextType {
    language: Language;
    setLanguage: (language: Language) => void;
    t: (key: string, replacements?: { [key: string]: string | number }) => string;
}

type TranslationData = { [key: string]: any };
type TranslationsMap = { [key in Language]?: TranslationData };

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguage] = useState<Language>('en');
    const [translations, setTranslations] = useState<TranslationsMap | null>(null);

    useEffect(() => {
        const fetchTranslations = async () => {
            try {
                const [enResponse, myResponse] = await Promise.all([
                    fetch('./translations/en.json'),
                    fetch('./translations/my.json')
                ]);
                if (!enResponse.ok || !myResponse.ok) {
                    throw new Error('Failed to load translation files.');
                }
                const enData = await enResponse.json();
                const myData = await myResponse.json();
                setTranslations({
                    en: enData,
                    my: myData,
                });
            } catch (error) {
                console.error("Error loading translations:", error);
                // Fallback to English if loading fails
                setTranslations({ en: {} }); 
            }
        };

        fetchTranslations();
    }, []);

    const t = (key: string, replacements?: { [key: string]: string | number }): string => {
        if (!translations) {
            return key; // Return key if translations are not loaded yet
        }

        const keys = key.split('.');
        let text: any = translations[language];
        let fallbackText: any = translations.en;

        for (const k of keys) {
            text = text?.[k];
            fallbackText = fallbackText?.[k];
        }

        let result = text || fallbackText || key;
        
        if (typeof result === 'string' && replacements) {
            Object.keys(replacements).forEach(placeholder => {
                result = result.replace(`{${placeholder}}`, String(replacements[placeholder]));
            });
        }
        
        return typeof result === 'string' ? result : key;
    };

    if (!translations) {
        // You can render a more sophisticated loading component here
        return <div>Loading...</div>;
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        {/* FIX: Corrected typo in closing tag from Language-context.Provider to LanguageContext.Provider */}
        </LanguageContext.Provider>
    );
};

export const useLanguage = (): LanguageContextType => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
};
