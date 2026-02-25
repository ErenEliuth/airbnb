import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { useSettings } from '../contexts/SettingsContext';
import {
    Bell, Home, Calendar, Users, DollarSign,
    CheckCircle2, Loader2, Unlock, ChevronRight, X, BellOff, MapPin
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale';

function nameFromEmail(email) {
    if (!email) return 'Anfitrión';
    const local = email.split('@')[0].replace(/\d+$/, '');
    const parts = local.replace(/([a-z])([A-Z])/g, '$1 $2').split(/[._\-\s]+/).filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || email.split('@')[0];
}

export function NotificationsPage() {
    const { user } = useAuth();
    const { t, formatPrice, language } = useSettings();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [releasing, setReleasing] = useState(null);
    const [toast, setToast] = useState(null);

    const dateLocale = language === 'en' ? enUS : language === 'fr' ? fr : es;

    useEffect(() => { if (user) fetchNotifications(); }, [user]);

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 4000);
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('notifications')
                .select('*, bookings(*), listings(title, city, location, price)')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            setNotifications(data || []);
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

    const releaseBooking = async (notification) => {
        const booking = notification.bookings;
        if (!booking) return;
        setReleasing(notification.id);
        try {
            const { error: bookingErr } = await supabase
                .from('bookings')
                .update({ status: 'released' })
                .eq('id', booking.id);
            if (bookingErr) throw bookingErr;

            const { data: listing } = await supabase
                .from('listings')
                .select('blocked_dates')
                .eq('id', booking.listing_id)
                .single();

            const currentBlocked = listing?.blocked_dates || [];
            const updatedBlocked = currentBlocked.filter(b => b.booking_id !== booking.id);

            await supabase
                .from('listings')
                .update({ blocked_dates: updatedBlocked })
                .eq('id', booking.listing_id);

            await supabase.from('notifications').insert({
                user_id: booking.user_id,
                type: 'booking_released',
                title: '📋 Reserva cancelada por el anfitrión',
                message: `El anfitrión liberó tus fechas reservadas del ${format(parseISO(booking.check_in), "d 'de' MMM", { locale: dateLocale })} al ${format(parseISO(booking.check_out), "d 'de' MMM yyyy", { locale: dateLocale })} en "${notification.listings?.title}". Las fechas ya están disponibles de nuevo.`,
                booking_id: booking.id,
                listing_id: booking.listing_id,
            });

            await supabase.from('notifications').update({ read: true }).eq('id', notification.id);

            setNotifications(prev => prev.map(n =>
                n.id === notification.id
                    ? { ...n, read: true, bookings: { ...n.bookings, status: 'released' } }
                    : n
            ));

            showToast('Fechas liberadas correctamente.', 'success');
        } catch (e) {
            console.error(e);
            showToast('Error al liberar las fechas.', 'error');
        } finally {
            setReleasing(null);
        }
    };

    const clearAll = async () => {
        if (!confirm('¿Seguro que quieres eliminar todas las notificaciones?')) return;
        setLoading(true);
        try {
            const { data, error } = await supabase.from('notifications')
                .delete()
                .eq('user_id', user.id)
                .select();

            if (error) throw error;

            if (data && data.length === 0 && notifications.length > 0) {
                throw new Error('Por favor, agrega la política de DELETE en Supabase SQL Editor para permitir borrar notificaciones.');
            }

            setNotifications([]);
            showToast('Notificaciones eliminadas', 'success');
        } catch (e) {
            console.error(e);
            showToast(e.message || 'Error al limpiar notificaciones', 'error');
        } finally {
            setLoading(false);
        }
    };

    const unread = notifications.filter(n => !n.read).length;

    return (
        <div className="min-h-screen bg-white pb-20 font-inherit">
            <Navbar />

            {toast && (
                <div className={`fixed top-24 right-6 z-50 flex items-center gap-3 border rounded-[20px] px-6 py-4 shadow-2xl max-w-sm animate-slide-in
                    ${toast.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm font-bold">{toast.msg}</p>
                    <button onClick={() => setToast(null)}><X className="w-4 h-4 opacity-50 hover:opacity-100" /></button>
                </div>
            )}

            <main className="pt-16 md:pt-24 max-w-4xl mx-auto px-4 sm:px-8">
                {/* Header */}
                <div className="flex items-center gap-5 mb-12">
                    <div className="relative bg-[#f7f7f7] p-4 rounded-[24px] border border-gray-100 shadow-sm">
                        <Bell className="w-8 h-8 text-[#222222]" />
                        {unread > 0 && (
                            <span className="absolute -top-1 -right-1 bg-[#FF385C] text-white text-[11px] font-black rounded-full px-1.5 py-0.5 min-w-[20px] h-5 flex items-center justify-center shadow-lg border-2 border-white">
                                {unread > 9 ? '9+' : unread}
                            </span>
                        )}
                    </div>
                    <div className="flex-1 flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-[#222222] tracking-tight">{t('nav.notifications')}</h1>
                            <p className="text-[#222222] opacity-60 font-medium">
                                {unread > 0 ? `${unread} sin leer` : 'Todo al día'}
                            </p>
                        </div>
                        {notifications.length > 0 && (
                            <button
                                onClick={clearAll}
                                className="text-sm font-bold underline hover:text-[#FF385C] transition-colors"
                            >
                                Limpiar todo
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-32 gap-4">
                        <Loader2 className="animate-spin text-[#FF385C]" size={48} strokeWidth={2.5} />
                        <p className="text-gray-500 font-medium font-inherit">Cargando notificaciones...</p>
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 max-w-2xl mx-auto px-6 font-inherit">
                        <div className="bg-white p-6 rounded-full shadow-lg mb-8">
                            <BellOff className="w-12 h-12 text-gray-300" strokeWidth={1} />
                        </div>
                        <h2 className="text-2xl font-bold text-[#222222] mb-3">Sin notificaciones</h2>
                        <p className="text-gray-500 text-lg">Cuando alguien reserve tu alojamiento o recibas un mensaje, aparecerá aquí.</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {notifications.map((n) => {
                            const booking = n.bookings;
                            const isReleased = booking?.status === 'released';
                            const isReceived = n.type === 'booking_received';

                            return (
                                <div
                                    key={n.id}
                                    onClick={() => !n.read && markRead(n.id)}
                                    className={`bg-white rounded-[28px] border p-6 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden
                                        ${!n.read ? 'border-[#FF385C] ring-1 ring-[#FF385C]/10' : 'border-gray-100'}`}
                                >
                                    <div className="flex items-start gap-6">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner
                                            ${isReleased ? 'bg-gray-100' : isReceived ? 'bg-rose-50' : 'bg-gray-50'}`}>
                                            {isReceived && !isReleased
                                                ? <Home className="w-7 h-7 text-[#FF385C]" />
                                                : <Unlock className="w-7 h-7 text-gray-400" />
                                            }
                                        </div>

                                        <div className="flex-1">
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className={`text-lg font-bold tracking-tight ${!n.read ? 'text-[#222222]' : 'text-gray-500'}`}>
                                                    {n.title}
                                                </h3>
                                                {!n.read && (
                                                    <span className="w-3 h-3 bg-[#FF385C] rounded-full shadow-[0_0_10px_rgba(255,56,92,0.4)]" />
                                                )}
                                            </div>
                                            <p className="text-[15px] text-gray-600 leading-relaxed mb-4">{n.message}</p>

                                            {booking && (
                                                <div className="bg-[#f7f7f7] rounded-[20px] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-medium border border-gray-100/50">
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <Calendar className="w-4 h-4 text-gray-400" />
                                                        <span>
                                                            {format(parseISO(booking.check_in), "d MMM", { locale: dateLocale })}
                                                            {' – '}
                                                            {format(parseISO(booking.check_out), "d MMM yyyy", { locale: dateLocale })}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <Users className="w-4 h-4 text-gray-400" />
                                                        <span>{booking.guests} {booking.guests > 1 ? 'huéspedes' : 'huésped'}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-gray-700">
                                                        <DollarSign className="w-4 h-4 text-gray-400" />
                                                        <span className="font-bold text-[#222222]">
                                                            {formatPrice(booking.total_price)}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest leading-none
                                                            ${isReleased ? 'bg-gray-200 text-gray-500' : 'bg-green-100 text-green-700'}`}>
                                                            {isReleased ? 'Liberada' : 'Confirmada'}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-center justify-between mt-6">
                                                <div>
                                                    {isReceived && !isReleased && booking && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); releaseBooking(n); }}
                                                            disabled={releasing === n.id}
                                                            className="flex items-center gap-2 text-sm font-bold text-[#FF385C] hover:text-white border border-[#FF385C] hover:bg-[#FF385C] rounded-full px-6 py-2.5 transition-all active:scale-95 disabled:opacity-50"
                                                        >
                                                            {releasing === n.id
                                                                ? <Loader2 className="w-4 h-4 animate-spin" />
                                                                : <Unlock className="w-4 h-4" />
                                                            }
                                                            Liberar fechas
                                                        </button>
                                                    )}

                                                    {isReleased && isReceived && (
                                                        <div className="flex items-center gap-2 text-sm text-gray-400 font-bold">
                                                            <CheckCircle2 className="w-4 h-4 text-gray-300" />
                                                            Fechas liberadas
                                                        </div>
                                                    )}
                                                </div>

                                                <p className="text-[11px] text-gray-400 font-black uppercase tracking-widest">
                                                    {format(new Date(n.created_at), "d MMMM, HH:mm", { locale: dateLocale })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
