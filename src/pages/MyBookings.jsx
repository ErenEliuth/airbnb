import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { useSettings } from '../contexts/SettingsContext';
import {
    MessageCircle, Calendar, Home, DollarSign,
    Loader2, CheckCircle2, XCircle, Clock, InboxIcon
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';

const statusConfig = {
    confirmed: { key: 'confirmed', color: 'bg-green-100 text-green-700', Icon: CheckCircle2 },
    released: { key: 'released', color: 'bg-red-100 text-red-600', Icon: XCircle },
    pending: { key: 'pending', color: 'bg-yellow-100 text-yellow-700', Icon: Clock },
};

export function MyBookingsPage() {
    const { user } = useAuth();
    const { t, formatPrice, language } = useSettings();
    const [notifications, setNotifications] = useState([]);
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('bookings');

    const dateLocale = language === 'en' ? enUS : language === 'fr' ? fr : es;

    useEffect(() => { if (user) fetchData(); }, [user]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: bData } = await supabase
                .from('bookings')
                .select('*, listings(id, title, city, location, images, price)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            const { data: nData } = await supabase
                .from('notifications')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            setBookings(bData || []);
            setNotifications(nData || []);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const markRead = async (id) => {
        await supabase.from('notifications').update({ read: true }).eq('id', id);
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const clearAllMessages = async () => {
        if (!confirm('¿Seguro que quieres eliminar todos los mensajes?')) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('notifications')
                .delete()
                .eq('user_id', user.id)
                .select();

            if (error) throw error;

            if (data && data.length === 0 && notifications.length > 0) {
                throw new Error('Por favor, agrega la política de DELETE en Supabase SQL Editor para permitir borrar los mensajes.');
            }

            setNotifications([]);
        } catch (e) {
            console.error(e);
            alert(e.message || 'Error al limpiar mensajes');
        } finally {
            setLoading(false);
        }
    };

    const unreadMessages = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-white pb-20 font-inherit">
            <Navbar />
            <main className="pt-16 md:pt-24 max-w-4xl mx-auto px-4 sm:px-8">

                {/* Page title - hidden on mobile since navbar shows title */}
                <div className="hidden md:flex items-center gap-4 mb-10">
                    <div className="bg-[#f7f7f7] p-3 rounded-2xl shadow-sm border border-gray-100">
                        <MessageCircle className="w-8 h-8 text-[#222222]" />
                    </div>
                    <h1 className="text-3xl font-bold text-[#222222] tracking-tight">{t('nav.trips')} & {t('nav.messages')}</h1>
                </div>
                {/* Mobile title */}
                <div className="md:hidden mb-6 pt-2">
                    <h1 className="text-[22px] font-bold text-[#222222] tracking-tight">{t('nav.trips')} & {t('nav.messages')}</h1>
                </div>

                {/* Tabs */}
                <div className="flex items-center justify-between border-b border-gray-100 mb-6 md:mb-10">
                    <div className="flex">
                        <button
                            onClick={() => setTab('bookings')}
                            className={`px-5 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold transition-all -mb-px
                                ${tab === 'bookings' ? 'border-b-2 border-[#222222] text-[#222222]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            {t('nav.trips')} ({bookings.length})
                        </button>
                        <button
                            onClick={() => setTab('messages')}
                            className={`px-5 md:px-8 py-3 md:py-4 text-sm md:text-base font-bold transition-all -mb-px flex items-center gap-2
                                ${tab === 'messages' ? 'border-b-2 border-[#222222] text-[#222222]' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                        >
                            {t('nav.messages')}
                            {unreadMessages > 0 && (
                                <span className="bg-[#FF385C] text-white text-[11px] font-black rounded-full px-1.5 py-0.5 min-w-[18px] h-[18px] flex items-center justify-center shadow-lg">
                                    {unreadMessages}
                                </span>
                            )}
                        </button>
                    </div>
                    {tab === 'messages' && notifications.length > 0 && (
                        <button
                            onClick={clearAllMessages}
                            className="text-xs md:text-sm font-bold underline hover:text-[#FF385C] transition-colors pr-1"
                        >
                            Limpiar
                        </button>
                    )}
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-[#FF385C]" size={48} strokeWidth={2.5} />
                        <p className="text-gray-500 font-medium">{t('home.loading') || 'Cargando...'}</p>
                    </div>
                ) : tab === 'bookings' ? (

                    bookings.length === 0 ? (
                        <div className="flex flex-col items-center py-32 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 max-w-2xl mx-auto px-6">
                            <div className="bg-white p-6 rounded-full shadow-lg mb-8">
                                <InboxIcon className="w-12 h-12 text-gray-300" strokeWidth={1} />
                            </div>
                            <h2 className="text-2xl font-bold text-[#222222] mb-3">{t('bookings.no_trips')}</h2>
                            <p className="text-gray-500 text-lg mb-10">{t('bookings.no_trips_desc')}</p>
                            <Link to="/" className="bg-[#222222] text-white px-10 py-4 rounded-full font-bold hover:bg-black transition-all shadow-md active:scale-95">
                                {t('home.view_all')}
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {bookings.map((b) => {
                                const nights = differenceInDays(parseISO(b.check_out), parseISO(b.check_in));
                                const status = statusConfig[b.status] || statusConfig.confirmed;
                                const StatusIcon = status.Icon;
                                const img = b.listings?.images?.[0];

                                return (
                                    <Link key={b.id} to={`/listing/${b.listing_id}`} className="group">
                                        <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300">
                                            {/* Thumbnail */}
                                            <div className="h-48 bg-gray-100 relative">
                                                {img
                                                    ? <img src={img} alt="listing" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                                                    : <div className="w-full h-full flex items-center justify-center"><Home className="w-12 h-12 text-gray-200" /></div>
                                                }
                                                <div className={`absolute top-4 right-4 flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-full shadow-sm backdrop-blur-md ${status.color}`}>
                                                    <StatusIcon className="w-3.5 h-3.5" />
                                                    <span className="uppercase tracking-wider">
                                                        {t(`bookings.status.${status.key}`)}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="p-6">
                                                <h3 className="font-bold text-lg text-[#222222] line-clamp-1 mb-1">
                                                    {b.listings?.title || t('bookings.unknown_listing')}
                                                </h3>
                                                <p className="text-[#222222] text-[15px] mb-4 opacity-70">
                                                    {b.listings?.city || b.listings?.location}
                                                </p>

                                                <div className="space-y-3 mb-6">
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <Calendar className="w-5 h-5 text-gray-400" />
                                                        <span className="font-medium">
                                                            {format(parseISO(b.check_in), "d MMM", { locale: dateLocale })}
                                                            {' – '}
                                                            {format(parseISO(b.check_out), "d MMM yyyy", { locale: dateLocale })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <DollarSign className="w-5 h-5 text-gray-400" />
                                                        <div className="flex items-center gap-2">
                                                            <span className="font-bold text-[#222222] text-lg">
                                                                {formatPrice(b.total_price)}
                                                            </span>
                                                            <span className="text-gray-400 font-medium">· {nights} {t('listing.nights')}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {b.status === 'confirmed' && (
                                                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4 flex items-center gap-3 text-sm text-green-700 font-bold">
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        {t('bookings.confirmed_msg')}
                                                    </div>
                                                )}

                                                {b.status === 'released' && (
                                                    <div className="bg-red-50/50 border border-red-100 rounded-2xl p-4 flex items-center gap-3 text-sm text-red-600 font-bold">
                                                        <XCircle className="w-5 h-5" />
                                                        {t('bookings.cancelled_msg')}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    )

                ) : (

                    /* ── MESSAGES TAB ── */
                    notifications.length === 0 ? (
                        <div className="flex flex-col items-center py-32 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 max-w-2xl mx-auto px-6">
                            <div className="bg-white p-6 rounded-full shadow-lg mb-8">
                                <MessageCircle className="w-12 h-12 text-gray-300" strokeWidth={1} />
                            </div>
                            <h2 className="text-2xl font-bold text-[#222222] mb-3">{t('bookings.no_messages')}</h2>
                            <p className="text-gray-500 text-lg">{t('bookings.no_messages_desc')}</p>
                        </div>
                    ) : (
                        <div className="max-w-3xl mx-auto space-y-6">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    onClick={() => !n.read && markRead(n.id)}
                                    className={`bg-white rounded-[24px] border p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer
                                        ${!n.read ? 'border-[#FF385C] ring-1 ring-[#FF385C]/20' : 'border-gray-100'}`}
                                >
                                    <div className="flex items-start gap-5">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner
                                            ${n.type === 'booking_confirmed' ? 'bg-green-50' : n.type === 'booking_released' ? 'bg-red-50' : 'bg-gray-50'}`}>
                                            {n.type === 'booking_confirmed'
                                                ? <CheckCircle2 className="w-6 h-6 text-green-500" />
                                                : n.type === 'booking_released'
                                                    ? <XCircle className="w-6 h-6 text-red-400" />
                                                    : <MessageCircle className="w-6 h-6 text-[#222222]" />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start gap-4 mb-2">
                                                <h3 className={`text-base font-bold tracking-tight ${!n.read ? 'text-[#222222]' : 'text-gray-700'}`}>
                                                    {n.title}
                                                </h3>
                                                {!n.read && <span className="w-2.5 h-2.5 bg-[#FF385C] rounded-full flex-shrink-0 mt-1.5 shadow-[0_0_8px_rgba(255,56,92,0.5)]" />}
                                            </div>
                                            <p className="text-[15px] text-gray-600 leading-relaxed font-normal">{n.message}</p>
                                            <p className="text-xs text-gray-400 mt-4 font-bold uppercase tracking-widest">
                                                {format(new Date(n.created_at), "d MMMM, HH:mm", { locale: dateLocale })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </main>
        </div>
    );
}
