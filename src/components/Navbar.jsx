import { Search, Globe, Menu, UserCircle, Users, Bell, MessageCircle, Heart, Map, Settings, HelpCircle, Gift, UserPlus, LogOut, Briefcase } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { WizardModal } from './HostWizard/WizardModal';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import { LanguageModal } from './LanguageModal';

/* ─── Tab icons (SVG inline para máxima fidelidad) ─── */
function IconAlojamientos() {
    return (
        <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 20L16 6l14 14" />
            <path d="M6 16v10h8v-6h4v6h8V16" />
        </svg>
    );
}
function IconExperiencias() {
    return (
        <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="16" cy="13" r="7" />
            <path d="M16 20v6M12 26h8" />
            <circle cx="16" cy="13" r="2.5" fill="currentColor" stroke="none" />
        </svg>
    );
}
function IconServicios() {
    return (
        <svg viewBox="0 0 32 32" className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 26s0-8 10-10c10 2 10 10 10 10" />
            <circle cx="16" cy="11" r="5" />
            <path d="M8 20h16" />
        </svg>
    );
}

export function Navbar() {
    const { user, signOut, openLoginModal } = useAuth();
    const { t, language, currency, activeTab, setActiveTab } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isLangModalOpen, setIsLangModalOpen] = useState(false);
    const [unreadNotif, setUnreadNotif] = useState(0);
    const [unreadMsg, setUnreadMsg] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const isHome = location.pathname === '/';

    // Search state
    const [city, setCity] = useState('');
    const [guests, setGuests] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    useEffect(() => {
        if (!user || !supabase) return;
        fetchUnread();
        const channel = supabase
            .channel('navbar-badge')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, fetchUnread)
            .subscribe();
        return () => supabase.removeChannel(channel);
    }, [user]);

    const fetchUnread = async () => {
        const { data } = await supabase
            .from('notifications')
            .select('type, read')
            .eq('user_id', user.id)
            .eq('read', false);
        if (data) {
            setUnreadNotif(data.filter(n => n.type === 'booking_received').length);
            setUnreadMsg(data.filter(n => n.type !== 'booking_received').length);
        }
    };

    const handleSignOut = async () => {
        await signOut();
        setIsMenuOpen(false);
        navigate('/');
    };

    const handleOpenWizard = () => {
        if (!user) openLoginModal();
        else setIsWizardOpen(true);
        setIsMenuOpen(false);
    };

    const handleSearch = () => {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (guests) params.set('guests', guests);
        if (startDate) params.set('start', startDate);
        if (endDate) params.set('end', endDate);

        navigate(`/?${params.toString()}`);
    };

    const tabs = [
        { id: 'alojamientos', label: t('nav.alojamientos'), Icon: IconAlojamientos, badge: false },
        { id: 'experiencias', label: t('nav.experiencias'), Icon: IconExperiencias, badge: true },
        { id: 'servicios', label: t('nav.servicios'), Icon: IconServicios, badge: true },
    ];

    return (
        <>
            <nav className="fixed w-full bg-white z-50 border-b border-gray-200 shadow-sm font-inherit">

                {/* ── Row 1: Logo | Tabs | User ── */}
                <div className="max-w-[2520px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-20">
                    <div className="flex justify-between items-center h-[80px]">

                        {/* Logo */}
                        <Link to="/" className="flex-shrink-0 flex items-center gap-1.5 min-w-[120px]">
                            <svg className="h-8 w-8 text-[#FF385C]" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                                <path d="M12 6.5c0 0-4 3.5-4 6.5a4 4 0 008 0c0-3-4-6.5-4-6.5z" />
                            </svg>
                            <span className="text-[#FF385C] text-xl font-bold hidden lg:block tracking-tight">airbnb</span>
                        </Link>

                        {/* Center tabs */}
                        <div className="flex items-center gap-2">
                            {tabs.map(({ id, label, Icon, badge }) => (
                                <button
                                    key={id}
                                    onClick={() => {
                                        setActiveTab(id);
                                        if (!isHome) navigate('/');
                                    }}
                                    className={`relative flex flex-col items-center gap-1 px-4 py-2 text-sm font-semibold transition-all rounded-full hover:bg-gray-100 group
                                        ${activeTab === id ? 'text-gray-900 bg-gray-50' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Icon />
                                        <span>{label}</span>
                                    </div>
                                    {badge && (
                                        <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                                            NOVEDAD
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-1">
                            <button
                                onClick={handleOpenWizard}
                                className="text-sm font-semibold hover:bg-gray-100 px-4 py-3 rounded-full transition whitespace-nowrap hidden md:block"
                            >
                                {t('nav.host')}
                            </button>

                            <div
                                onClick={() => setIsLangModalOpen(true)}
                                className="hover:bg-gray-100 p-3 rounded-full cursor-pointer flex items-center justify-center transition"
                            >
                                <Globe size={18} />
                            </div>

                            {/* Hamburger + avatar */}
                            <div className="relative">
                                <button
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    className="flex items-center gap-2 border border-gray-300 rounded-full py-1.5 pl-3 pr-1 hover:shadow-md transition ml-1"
                                >
                                    <Menu size={16} />
                                    <div className="bg-gray-500 rounded-full text-white overflow-hidden w-[30px] h-[30px] flex items-center justify-center relative">
                                        {user?.user_metadata?.avatar_url ? (
                                            <img src={user.user_metadata.avatar_url} alt="User" className="w-full h-full object-cover" />
                                        ) : user ? (
                                            <div className="bg-gray-700 text-white w-full h-full flex items-center justify-center font-semibold text-xs">
                                                {user.email?.charAt(0).toUpperCase()}
                                            </div>
                                        ) : (
                                            <UserCircle size={30} className="text-gray-400" />
                                        )}
                                        {/* Unread badge on avatar */}
                                        {(unreadNotif + unreadMsg) > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                                                {unreadNotif + unreadMsg}
                                            </span>
                                        )}
                                    </div>
                                </button>

                                {isMenuOpen && (
                                    <div className="absolute right-0 mt-3 w-[260px] bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 font-inherit overflow-hidden">
                                        {!user ? (
                                            <>
                                                <button onClick={() => { setIsMenuOpen(false); openLoginModal(); }} className="w-full text-left block px-4 py-3 hover:bg-gray-50 text-[14px] font-bold text-gray-900">{t('nav.signup')}</button>
                                                <button onClick={() => { setIsMenuOpen(false); openLoginModal(); }} className="w-full text-left block px-4 py-3 hover:bg-gray-50 text-[14px] text-gray-700 border-b border-gray-100">{t('nav.login')}</button>
                                                <div onClick={handleOpenWizard} className="block px-4 py-3 hover:bg-gray-50 text-[14px] cursor-pointer text-gray-700">{t('nav.host')}</div>
                                                <div className="block px-4 py-3 hover:bg-gray-50 text-[14px] text-gray-700">Ayuda</div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col">
                                                <div className="py-2 border-b border-gray-100">
                                                    <Link to="/mis-reservas" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                                                        <Heart size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] font-semibold text-gray-900">{t('nav.favorites')}</span>
                                                    </Link>
                                                    <Link to="/mis-reservas" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                                                        <Map size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.trips')}</span>
                                                    </Link>
                                                    <Link to="/mis-reservas" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                                                        <MessageCircle size={16} className="text-gray-500 group-hover:text-black" />
                                                        <div className="flex-1 flex justify-between items-center">
                                                            <span className="text-[14px] font-semibold text-gray-900">{t('nav.messages')}</span>
                                                            {unreadMsg > 0 && <span className="bg-rose-500 text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center font-bold">{unreadMsg}</span>}
                                                        </div>
                                                    </Link>
                                                    <Link to="/profile?tab=listings" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                                                        <Briefcase size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.my_listings')}</span>
                                                    </Link>
                                                    <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group">
                                                        <UserCircle size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.profile')}</span>
                                                    </Link>
                                                </div>

                                                <div className="py-2 border-b border-gray-100">
                                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group cursor-pointer">
                                                        <Settings size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.account_settings')}</span>
                                                    </div>
                                                    <div onClick={() => { setIsLangModalOpen(true); setIsMenuOpen(false); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group cursor-pointer">
                                                        <Globe size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.language_currency')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group cursor-pointer">
                                                        <HelpCircle size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.help_center')}</span>
                                                    </div>
                                                </div>

                                                <div className="py-2 border-b border-gray-100">
                                                    <div onClick={handleOpenWizard} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group cursor-pointer">
                                                        <Gift size={16} className="text-gray-500 group-hover:text-black" />
                                                        <div className="flex-1">
                                                            <span className="text-[14px] font-semibold text-gray-900">{t('nav.host')}</span>
                                                            <p className="text-[11px] text-gray-500">Gana dinero con tu espacio</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group cursor-pointer">
                                                        <UserPlus size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.invite_host')}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group cursor-pointer">
                                                        <Users size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.find_cohost')}</span>
                                                    </div>
                                                </div>

                                                <div className="py-2">
                                                    <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 group text-left">
                                                        <LogOut size={16} className="text-gray-500 group-hover:text-black" />
                                                        <span className="text-[14px] text-gray-700">{t('nav.logout')}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Row 2: Search bar ── */}
                {isHome && (
                    <div className="max-w-5xl mx-auto px-4 sm:px-8 lg:px-12 pb-6 hidden md:block">
                        <div className="flex items-center border border-gray-300 rounded-full shadow-lg hover:shadow-xl transition bg-white w-full mx-auto relative overflow-hidden group/search-bar">
                            {/* Dónde */}
                            <div className="flex-[1.5] px-8 py-3.5 hover:bg-gray-100 rounded-full transition cursor-pointer relative z-10">
                                <div className="text-[11px] font-bold text-gray-900 tracking-wide uppercase">{t('search.where')}</div>
                                <input
                                    type="text"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    placeholder={t('search.where_placeholder')}
                                    className="w-full text-sm text-gray-500 font-normal outline-none bg-transparent placeholder-gray-400 mt-0.5"
                                />
                            </div>

                            {/* Separator */}
                            <div className="h-8 w-px bg-gray-200" />

                            {/* Fechas */}
                            <div className="flex-[2] flex gap-2 px-8 py-3.5 hover:bg-gray-100 rounded-full transition cursor-pointer relative z-10">
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-900 tracking-wide uppercase">{t('search.check_in')}</div>
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full text-sm text-gray-500 outline-none bg-transparent mt-0.5"
                                    />
                                </div>
                                <div className="w-px h-8 bg-gray-200 self-center mx-2" />
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-900 tracking-wide uppercase">{t('search.check_out')}</div>
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full text-sm text-gray-500 outline-none bg-transparent mt-0.5"
                                    />
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="h-8 w-px bg-gray-200" />

                            {/* Quién + búsqueda */}
                            <div className="flex items-center gap-2 pr-2 pl-8 py-2.5 hover:bg-gray-100 rounded-full transition cursor-pointer flex-1 relative z-10">
                                <div className="flex-1">
                                    <div className="text-[11px] font-bold text-gray-900 tracking-wide uppercase">{t('search.who')}</div>
                                    <input
                                        type="number"
                                        min="1"
                                        value={guests}
                                        onChange={(e) => setGuests(e.target.value)}
                                        placeholder={t('search.who_placeholder')}
                                        className="w-full text-sm text-gray-500 font-normal outline-none bg-transparent placeholder-gray-400 mt-0.5"
                                    />
                                </div>
                                <button
                                    onClick={handleSearch}
                                    className="bg-[#FF385C] p-4 rounded-full text-white shadow-md hover:bg-[#D80565] transition-all flex-shrink-0 flex items-center gap-2"
                                >
                                    <Search size={16} strokeWidth={3} />
                                    <span className="font-bold text-[14px] pr-1 hidden group-hover/search-bar:block px-2">Buscar</span>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Mobile search */}
                {isHome && (
                    <div className="md:hidden px-4 pb-4">
                        <div className="flex items-center gap-3 bg-white border border-gray-300 rounded-full shadow-md p-3">
                            <Search className="text-gray-700" size={18} />
                            <div className="flex-1 cursor-pointer" onClick={handleSearch}>
                                <div className="text-sm font-semibold">¿A dónde quieres ir?</div>
                                <div className="text-xs text-gray-500">Cualquier lugar • Cualquier semana • ¿Cuántos?</div>
                            </div>
                            <div className="p-2 border border-gray-200 rounded-full">
                                <Users size={14} />
                            </div>
                        </div>
                    </div>
                )}

            </nav>

            <WizardModal isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />
            <LanguageModal isOpen={isLangModalOpen} onClose={() => setIsLangModalOpen(false)} />
        </>
    );
}
