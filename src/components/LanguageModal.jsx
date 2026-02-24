import React from 'react';
import { X, Check, Globe, DollarSign } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const languages = [
    { id: 'es', name: 'Español', region: 'Colombia' },
    { id: 'en', name: 'English', region: 'United Kingdom' },
    { id: 'fr', name: 'Français', region: 'France' },
];

const currencies = [
    { id: 'COP', name: 'Peso colombiano', symbol: 'COP - $' },
    { id: 'USD', name: 'Dólar estadounidense', symbol: 'USD - $' },
    { id: 'EUR', name: 'Euro', symbol: 'EUR - €' },
];

export function LanguageModal({ isOpen, onClose }) {
    const { language, setLanguage, currency, setCurrency, t } = useSettings();
    const [activeTab, setActiveTab] = React.useState('lang'); // 'lang' or 'curr'

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#222222]/50 p-4 backdrop-blur-sm transition-all duration-300">
            <div className="bg-white rounded-[32px] w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,0.2)] relative animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <header className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-10">
                    <button onClick={onClose} className="p-2.5 hover:bg-gray-100 rounded-full transition-all active:scale-90">
                        <X size={20} strokeWidth={2.5} className="text-gray-900" />
                    </button>
                    <div className="flex gap-10">
                        <button
                            onClick={() => setActiveTab('lang')}
                            className={`pb-4 pt-1 text-sm font-black uppercase tracking-widest transition-all relative
                                ${activeTab === 'lang' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t('settings.language_region') || 'Idioma y región'}
                            {activeTab === 'lang' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />}
                        </button>
                        <button
                            onClick={() => setActiveTab('curr')}
                            className={`pb-4 pt-1 text-sm font-black uppercase tracking-widest transition-all relative
                                ${activeTab === 'curr' ? 'text-black' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            {t('settings.currency') || 'Moneda'}
                            {activeTab === 'curr' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-black rounded-full" />}
                        </button>
                    </div>
                    <div className="w-10" />
                </header>

                {/* Body */}
                <main className="flex-1 overflow-y-auto p-10 font-inherit">
                    {activeTab === 'lang' ? (
                        <div className="animate-in slide-in-from-left-4 duration-500">
                            <h2 className="text-2xl font-bold mb-8 text-[#222222] tracking-tight flex items-center gap-3">
                                <Globe size={24} className="text-[#FF385C]" />
                                {t('settings.suggested_languages') || 'Idiomas y regiones sugeridos'}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {languages.map((lang) => (
                                    <button
                                        key={lang.id}
                                        onClick={() => {
                                            setLanguage(lang.id);
                                            onClose();
                                        }}
                                        className={`group p-6 rounded-[24px] border-2 text-left transition-all duration-300 relative overflow-hidden
                                            ${language === lang.id
                                                ? 'border-[#222222] bg-gray-50'
                                                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-bold text-lg text-[#222222] mb-1">{lang.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{lang.region}</div>
                                        {language === lang.id && (
                                            <div className="absolute top-4 right-4 bg-black text-white p-1 rounded-full">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in slide-in-from-right-4 duration-500">
                            <h2 className="text-2xl font-bold mb-8 text-[#222222] tracking-tight flex items-center gap-3">
                                <DollarSign size={24} className="text-[#FF385C]" />
                                {t('settings.select_currency') || 'Selecciona una moneda'}
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currencies.map((curr) => (
                                    <button
                                        key={curr.id}
                                        onClick={() => {
                                            setCurrency(curr.id);
                                            onClose();
                                        }}
                                        className={`group p-6 rounded-[24px] border-2 text-left transition-all duration-300 relative overflow-hidden
                                            ${currency === curr.id
                                                ? 'border-[#222222] bg-gray-50'
                                                : 'border-transparent hover:border-gray-200 hover:bg-gray-50'}`}
                                    >
                                        <div className="font-bold text-lg text-[#222222] mb-1">{curr.name}</div>
                                        <div className="text-sm text-gray-500 font-medium">{curr.symbol}</div>
                                        {currency === curr.id && (
                                            <div className="absolute top-4 right-4 bg-black text-white p-1 rounded-full">
                                                <Check size={12} strokeWidth={4} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </main>

                {/* Footer hint */}
                <footer className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest italic">
                    <Check className="text-[#FF385C]" size={14} strokeWidth={3} />
                    Cambia la configuración para ver precios y descripciones en tu moneda e idioma preferidos.
                </footer>
            </div>
        </div>
    );
}
