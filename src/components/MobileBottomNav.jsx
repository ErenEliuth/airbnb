import { Search, Heart, Map, MessageCircle, UserCircle, UserPlus } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';
import { useState } from 'react';
import { WizardModal } from './HostWizard/WizardModal';

export function MobileBottomNav() {
    const location = useLocation();
    const { user, openLoginModal } = useAuth();
    const { t } = useSettings();
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const tabs = [
        { id: 'explore', label: 'Explorar', icon: Search, path: '/' },
        { id: 'wishlist', label: 'Favoritos', icon: Heart, path: '/mis-reservas' },
        { id: 'host', label: 'Anfitrión', icon: UserPlus, path: null, action: 'host' },
        { id: 'messages', label: 'Mensajes', icon: MessageCircle, path: '/notifications' },
        { id: 'profile', label: 'Perfil', icon: UserCircle, path: user ? '/profile' : null },
    ];

    const handleClick = (e, tab) => {
        if (tab.action === 'host') {
            e.preventDefault();
            if (!user) {
                openLoginModal();
            } else {
                setIsWizardOpen(true);
            }
            return;
        }

        if (!tab.path) {
            e.preventDefault();
            openLoginModal();
        }
    };

    return (
        <>
            <div
                className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 flex justify-around items-center z-[100] shadow-[0_-2px_15px_rgba(0,0,0,0.08)]"
                style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 12px)', paddingTop: '10px' }}
            >
                {tabs.map((tab) => {
                    const isActive = location.pathname === tab.path;
                    const Icon = tab.icon;

                    return (
                        <Link
                            key={tab.id}
                            to={tab.path || '#'}
                            onClick={(e) => handleClick(e, tab)}
                            className={`flex flex-col items-center gap-[3px] px-2 py-1 transition-colors min-w-[64px] ${isActive ? 'text-[#FF385C]' : 'text-gray-500 hover:text-black'
                                }`}
                        >
                            <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                            <span className={`text-[9.5px] font-bold tracking-tight leading-tight text-center ${isActive ? 'text-[#FF385C]' : 'text-gray-500'}`}>
                                {tab.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
            <WizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
        </>
    );
}
