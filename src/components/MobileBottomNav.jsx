import { Search, Heart, Map, MessageCircle, UserCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

export function MobileBottomNav() {
    const location = useLocation();
    const { user, openLoginModal } = useAuth();
    const { t } = useSettings();

    const tabs = [
        { id: 'explore', label: 'Explorar', icon: Search, path: '/' },
        { id: 'wishlist', label: 'Favoritos', icon: Heart, path: '/mis-reservas' },
        { id: 'trips', label: 'Viajes', icon: Map, path: '/mis-reservas' },
        { id: 'messages', label: 'Mensajes', icon: MessageCircle, path: '/notifications' },
        { id: 'profile', label: user ? 'Perfil' : 'Inicia sesión', icon: UserCircle, path: user ? '/profile' : null },
    ];

    const handleClick = (e, path) => {
        if (!path) {
            e.preventDefault();
            openLoginModal();
        }
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-[100] pb-safe">
            {tabs.map((tab) => {
                const isActive = location.pathname === tab.path;
                const Icon = tab.icon;

                return (
                    <Link
                        key={tab.id}
                        to={tab.path || '#'}
                        onClick={(e) => handleClick(e, tab.path)}
                        className={`flex flex-col items-center gap-1 min-w-[64px] transition-colors ${isActive ? 'text-[#FF385C]' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="text-[10px] font-medium">{tab.label}</span>
                    </Link>
                );
            })}
        </div>
    );
}
