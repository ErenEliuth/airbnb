import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { useSettings } from '../contexts/SettingsContext';
import {
    Star, MapPin, User, Loader2, ChevronDown, ChevronLeft, Heart,
    Award, ShieldCheck, AlertCircle, CheckCircle2, X
} from 'lucide-react';
import { differenceInDays, format, eachDayOfInterval, parseISO, isBefore, isAfter, startOfDay } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { LeafletMap } from '../components/LeafletMap';

/* ─── Utility: derive a display name from an email ─── */
function nameFromEmail(email) {
    if (!email) return 'Anfitrión';
    const local = email.split('@')[0];
    const withoutDigits = local.replace(/\d+$/, '');
    const parts = withoutDigits
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(/[._\-\s]+/)
        .filter(Boolean);
    return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || local;
}

/* ─── Toast component ─── */
function Toast({ message, type, onClose }) {
    const colors = {
        success: 'bg-green-50 border-green-400 text-green-800',
        error: 'bg-red-50 border-red-400 text-red-800',
        warning: 'bg-yellow-50 border-yellow-400 text-yellow-800',
    };
    const Icon = type === 'success' ? CheckCircle2 : AlertCircle;
    return (
        <div className={`fixed top-24 right-6 z-50 flex items-start gap-3 border rounded-xl px-5 py-4 shadow-xl max-w-sm animate-slide-in ${colors[type]}`}>
            <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <p className="text-sm font-medium">{message}</p>
            <button onClick={onClose} className="ml-auto -mt-0.5 opacity-60 hover:opacity-100">
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}

export function ListingDetails() {
    const { id } = useParams();
    const { user } = useAuth();
    const { t, formatPrice, language } = useSettings();
    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({ from: undefined, to: undefined });
    const [guests, setGuests] = useState(1);
    const [booking, setBooking] = useState(false);
    const [toast, setToast] = useState(null);
    const [hostEmail, setHostEmail] = useState(null);
    const [blockedDates, setBlockedDates] = useState([]);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const dateLocale = language === 'en' ? enUS : language === 'fr' ? fr : es;

    useEffect(() => { fetchListing(); }, [id]);

    const showToast = (message, type = 'success') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 5000);
    };

    const fetchListing = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*')
                .eq('id', id)
                .single();
            if (error) throw error;
            setListing(data);
            if (data?.host_email) setHostEmail(data.host_email);

            const { data: bookingsData } = await supabase
                .from('bookings')
                .select('check_in, check_out')
                .eq('listing_id', id)
                .eq('status', 'confirmed');

            const allBlocked = [];

            const blocked = data?.blocked_dates || [];
            for (const range of blocked) {
                if (range.status === 'released') continue;
                try {
                    const days = eachDayOfInterval({
                        start: startOfDay(parseISO(range.from)),
                        end: startOfDay(parseISO(range.to)),
                    });
                    allBlocked.push(...days);
                } catch { }
            }

            if (bookingsData) {
                for (const b of bookingsData) {
                    try {
                        const days = eachDayOfInterval({
                            start: startOfDay(parseISO(b.check_in)),
                            end: startOfDay(parseISO(b.check_out)),
                        });
                        allBlocked.push(...days);
                    } catch { }
                }
            }

            setBlockedDates(allBlocked);
        } catch (err) {
            console.error('Error fetching listing:', err);
        } finally {
            setLoading(false);
        }
    };

    const availFrom = listing?.available_from ? startOfDay(parseISO(listing.available_from)) : null;
    const availTo = listing?.available_to ? startOfDay(parseISO(listing.available_to)) : null;

    const handleSelect = (range) => {
        if (!range) { setDateRange({ from: undefined, to: undefined }); return; }
        let { from, to } = range;
        if (from && availFrom && isBefore(startOfDay(from), availFrom)) from = availFrom;
        if (from && availTo && isAfter(startOfDay(from), availTo)) from = availTo;
        if (to && availTo && isAfter(startOfDay(to), availTo)) to = availTo;
        if (to && availFrom && isBefore(startOfDay(to), availFrom)) to = availFrom;
        setDateRange({ from, to });
    };

    const nights = dateRange.from && dateRange.to
        ? Math.max(0, differenceInDays(dateRange.to, dateRange.from))
        : 0;
    const total = nights > 0 && listing ? listing.price * nights : 0;

    const isOwner = user && listing && user.id === listing.host_id;

    const handleBooking = async () => {
        if (!user) { showToast('Debes iniciar sesión para reservar.', 'warning'); return; }
        if (isOwner) { showToast('No puedes reservar tu propia publicación.', 'error'); return; }
        if (!dateRange.from || !dateRange.to || nights === 0) {
            showToast('Selecciona las fechas de llegada y salida.', 'warning');
            return;
        }

        setBooking(true);
        try {
            const checkIn = format(dateRange.from, 'yyyy-MM-dd');
            const checkOut = format(dateRange.to, 'yyyy-MM-dd');

            const { data: newBooking, error: bookingErr } = await supabase
                .from('bookings')
                .insert({
                    listing_id: id,
                    user_id: user.id,
                    check_in: checkIn,
                    check_out: checkOut,
                    guests: Number(guests),
                    total_price: total,
                    status: 'confirmed',
                })
                .select()
                .single();
            if (bookingErr) throw bookingErr;

            const guestName = nameFromEmail(user.email);
            await supabase.from('notifications').insert({
                user_id: listing.host_id,
                type: 'booking_received',
                title: `🏠 Nueva reserva en "${listing.title}"`,
                message: `${guestName} reservó del ${format(dateRange.from, "d 'de' MMMM", { locale: dateLocale })} al ${format(dateRange.to, "d 'de' MMMM yyyy", { locale: dateLocale })} · ${nights} noche${nights > 1 ? 's' : ''} · ${formatPrice(total)} total.`,
                booking_id: newBooking.id,
                listing_id: id,
            });

            await supabase.from('notifications').insert({
                user_id: user.id,
                type: 'booking_confirmed',
                title: `✅ Reserva confirmada — ${listing.title}`,
                message: `Tu reserva está confirmada y vigente del ${format(dateRange.from, "d 'de' MMMM", { locale: dateLocale })} al ${format(dateRange.to, "d 'de' MMMM yyyy", { locale: dateLocale })}. Total pagado: ${formatPrice(total)}.`,
                booking_id: newBooking.id,
                listing_id: id,
            });

            const newDays = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
            setBlockedDates(prev => [...prev, ...newDays]);

            showToast(`¡Reserva confirmada! ${nights} noche${nights > 1 ? 's' : ''} · ${formatPrice(total)}`, 'success');
            setDateRange({ from: undefined, to: undefined });
        } catch (err) {
            console.error(err);
            showToast('Error al realizar la reserva. Inténtalo de nuevo.', 'error');
        } finally {
            setBooking(false);
        }
    };

    const hostDisplayName = hostEmail
        ? nameFromEmail(hostEmail)
        : (user && isOwner ? nameFromEmail(user.email) : 'Anfitrión');

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-rose-500" size={40} />
            </div>
        );
    }
    if (!listing) {
        return <div className="text-center py-20">Publicación no encontrada</div>;
    }

    return (
        <div className="min-h-screen bg-white pb-20 font-inherit">
            <Navbar />

            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            <main className="pt-24 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                {/* Header */}
                <h1 className="text-[26px] font-bold text-[#222222] mb-2 tracking-tight">{listing.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-6 flex-wrap font-medium">
                    <div className="flex items-center gap-1.5">
                        <Star className="w-3.5 h-3.5 fill-black text-black" />
                        <span className="text-black font-semibold">New</span>
                    </div>
                    <span>·</span>
                    <span className="underline font-bold text-black cursor-pointer hover:bg-gray-50">{listing.location}</span>
                </div>

                {/* Images Grid */}
                <div className="rounded-xl overflow-hidden bg-gray-100 mb-10 grid gap-2 h-[350px] md:h-[480px] relative grid-cols-1 md:grid-cols-4 md:grid-rows-2">
                    {/* Foto Principal */}
                    <div className={`relative ${listing.images?.length === 1 ? 'col-span-4 row-span-2' : 'md:col-span-2 md:row-span-2'
                        }`}>
                        <img
                            src={listing.images?.[0] || 'https://via.placeholder.com/800'}
                            alt={listing.title}
                            className="w-full h-full object-cover hover:brightness-90 transition duration-500 cursor-pointer"
                        />
                    </div>

                    {/* Fotos Secundarias (mapeo dinámico hasta 5 fotos) */}
                    {listing.images?.slice(1, 5).map((img, i) => {
                        let spanClass = "col-span-1 row-span-1";
                        const total = listing.images.length;

                        if (total === 2) spanClass = "md:col-span-2 md:row-span-2";
                        else if (total === 3) spanClass = "md:col-span-2 md:row-span-1";
                        else if (total === 4) {
                            if (i === 2) spanClass = "md:col-span-2 md:row-span-1";
                            else spanClass = "md:col-span-1 md:row-span-1";
                        }

                        return (
                            <div key={i} className={`hidden md:block relative overflow-hidden ${spanClass}`}>
                                <img
                                    src={img}
                                    alt={`Vista ${i + 2}`}
                                    className="w-full h-full object-cover hover:brightness-90 transition duration-500 cursor-pointer"
                                />
                            </div>
                        );
                    })}

                    {/* Botón Mostrar Todas (si hay más de 1) */}
                    {listing.images?.length > 1 && (
                        <button
                            onClick={() => setIsPhotoModalOpen(true)}
                            className="absolute bottom-6 right-6 bg-white border border-black px-4 py-1.5 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 flex items-center gap-2 z-10"
                        >
                            <div className="grid grid-cols-2 gap-0.5">
                                <div className="w-1.5 h-1.5 bg-black rounded-[1px]"></div>
                                <div className="w-1.5 h-1.5 bg-black rounded-[1px]"></div>
                                <div className="w-1.5 h-1.5 bg-black rounded-[1px]"></div>
                                <div className="w-1.5 h-1.5 bg-black rounded-[1px]"></div>
                            </div>
                            Mostrar todas las fotos
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">

                    {/* ── Left Column ── */}
                    <div className="md:col-span-2 space-y-10">

                        {/* Host info */}
                        <div className="flex justify-between border-b border-gray-100 pb-8">
                            <div>
                                <h2 className="text-2xl font-bold text-[#222222] mb-1">
                                    {t('listing.hosted_by')} {hostDisplayName}
                                </h2>
                                <p className="text-gray-500 text-lg">{listing.room_type} · {listing.property_type}</p>
                            </div>
                            <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center text-white flex-shrink-0 shadow-lg">
                                <User className="w-8 h-8" />
                            </div>
                        </div>

                        {/* Highlights */}
                        <div className="border-b border-gray-100 pb-8 space-y-8">
                            <div className="flex gap-4">
                                <Award className="w-8 h-8 text-gray-700 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg text-[#222222]">Este es un lugar destacado</h3>
                                    <p className="text-gray-500 text-[15px] leading-relaxed">Los huéspedes lo recomiendan por su excelente ubicación.</p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <ShieldCheck className="w-8 h-8 text-gray-700 mt-1" />
                                <div>
                                    <h3 className="font-bold text-lg text-[#222222]">Reserva con confianza</h3>
                                    <p className="text-gray-500 text-[15px] leading-relaxed">Tu estancia está protegida de principio a fin.</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="border-b border-gray-100 pb-10">
                            <p className="text-gray-800 text-[17px] leading-[26px] whitespace-pre-wrap font-normal">
                                {listing.description}
                            </p>
                        </div>

                        {/* Amenities */}
                        <div className="border-b border-gray-100 pb-10">
                            <h2 className="text-2xl font-bold text-[#222222] mb-6">Lo que ofrece este lugar</h2>
                            <div className="grid grid-cols-2 gap-y-4 gap-x-12">
                                {listing.amenities?.length > 0
                                    ? listing.amenities.map((amenity) => (
                                        <div key={amenity} className="flex items-center gap-4 text-gray-700">
                                            <div className="capitalize text-lg">{amenity}</div>
                                        </div>
                                    ))
                                    : <p className="text-gray-400">No hay servicios especificados.</p>
                                }
                            </div>
                        </div>

                        {/* ── Calendar ── */}
                        <div className="border-b border-gray-100 pb-10">
                            <h2 className="text-2xl font-bold text-[#222222] mb-1">
                                {nights > 0
                                    ? `${nights} ${t('listing.nights')} en ${listing.city || listing.location}`
                                    : `Disponibilidad en ${listing.city || listing.location}`}
                            </h2>

                            {availFrom && availTo ? (
                                <p className="text-gray-500 mb-6 text-[15px]">
                                    Disponible:{' '}
                                    <span className="font-bold text-[#222222]">
                                        {format(availFrom, "d 'de' MMMM yyyy", { locale: dateLocale })}
                                    </span>
                                    {' – '}
                                    <span className="font-bold text-[#222222]">
                                        {format(availTo, "d 'de' MMMM yyyy", { locale: dateLocale })}
                                    </span>
                                </p>
                            ) : (
                                <p className="text-gray-400 mb-6 text-[15px]">El anfitrión no definió fechas de disponibilidad.</p>
                            )}

                            <div className="w-full bg-[#f7f7f7] p-8 rounded-[24px] flex justify-center overflow-x-auto shadow-inner">
                                <DayPicker
                                    mode="range"
                                    selected={dateRange}
                                    onSelect={handleSelect}
                                    numberOfMonths={2}
                                    locale={dateLocale}
                                    fromDate={availFrom ?? new Date()}
                                    toDate={availTo ?? undefined}
                                    disabled={[
                                        ...(availFrom ? [{ before: availFrom }] : []),
                                        ...(availTo ? [{ after: availTo }] : []),
                                        ...blockedDates,
                                    ]}
                                    modifiersStyles={{
                                        selected: { backgroundColor: '#222', color: 'white', fontWeight: 'bold' },
                                        range_start: { backgroundColor: '#222', color: 'white', borderRadius: '50%' },
                                        range_end: { backgroundColor: '#222', color: 'white', borderRadius: '50%' },
                                        range_middle: { backgroundColor: '#f3f4f6', color: '#222' },
                                    }}
                                />
                            </div>

                            {(dateRange.from || dateRange.to) && (
                                <button
                                    onClick={() => setDateRange({ from: undefined, to: undefined })}
                                    className="mt-6 text-sm font-bold underline text-[#222222] hover:bg-gray-50 px-3 py-1 rounded"
                                >
                                    {t('home.clear_all')}
                                </button>
                            )}
                        </div>

                    </div>

                    {/* ── Right Column: Booking Widget ── */}
                    <div className="relative">
                        <div className="sticky top-32 border border-gray-100 rounded-[24px] p-6 shadow-2xl bg-white w-full max-w-[400px] ml-auto">

                            {/* Price header */}
                            <div className="flex justify-between items-end mb-6">
                                <div>
                                    <span className="text-2xl font-bold text-[#222222]">{formatPrice(listing.price)}</span>
                                    <span className="text-gray-500 text-lg"> {t('listing.night')}</span>
                                </div>
                                {nights > 0 && (
                                    <span className="text-sm font-bold text-[#FF385C] uppercase tracking-wider">{nights} {t('listing.nights')}</span>
                                )}
                            </div>

                            {/* Pricing table */}
                            {total > 0 && (
                                <div className="space-y-4 mb-6 pt-2 border-t border-gray-100">
                                    <div className="flex justify-between text-[#222222]">
                                        <span className="underline">{formatPrice(listing.price)} × {nights} {t('listing.nights')}</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                    <div className="flex justify-between text-[#222222]">
                                        <span className="underline">Tarifa de servicio</span>
                                        <span>$0</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-xl pt-4 border-t border-gray-900 text-[#222222]">
                                        <span>Total</span>
                                        <span>{formatPrice(total)}</span>
                                    </div>
                                </div>
                            )}

                            {/* Booking Inputs */}
                            <div className="border border-gray-400 rounded-2xl overflow-hidden mb-6">
                                <div className="grid grid-cols-2 border-b border-gray-400">
                                    <div className="p-3 border-r border-gray-400 hover:bg-gray-50 transition cursor-pointer">
                                        <label className="block text-[10px] font-black uppercase tracking-tight text-[#222222] mb-1">{t('search.check_in')}</label>
                                        <div className="text-[15px] font-medium text-gray-700">
                                            {dateRange.from ? format(dateRange.from, 'd/MM/yyyy') : 'Add date'}
                                        </div>
                                    </div>
                                    <div className="p-3 hover:bg-gray-50 transition cursor-pointer">
                                        <label className="block text-[10px] font-black uppercase tracking-tight text-[#222222] mb-1">{t('search.check_out')}</label>
                                        <div className="text-[15px] font-medium text-gray-700">
                                            {dateRange.to ? format(dateRange.to, 'd/MM/yyyy') : 'Add date'}
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 hover:bg-gray-50 transition">
                                    <label className="block text-[10px] font-black uppercase tracking-tight text-[#222222] mb-1">{t('search.who')}</label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={guests}
                                        onChange={(e) => setGuests(e.target.value)}
                                        className="w-full text-[15px] font-medium text-gray-700 outline-none bg-transparent"
                                    />
                                </div>
                            </div>

                            {isOwner && (
                                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 text-amber-800 text-sm font-medium">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <span>Eres el anfitrión de esta publicación.</span>
                                </div>
                            )}

                            <button
                                onClick={handleBooking}
                                disabled={booking || isOwner || !user}
                                className={`w-full font-bold py-4 rounded-xl transition-all text-lg shadow-lg mb-4 text-white
                                    ${isOwner || !user
                                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                                        : 'bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] hover:brightness-110 active:scale-[0.98]'
                                    }`}
                            >
                                {booking ? <Loader2 size={24} className="animate-spin mx-auto" /> : 'Reservar'}
                            </button>

                            <p className="text-center text-[15px] text-gray-500 font-medium">No se te cobrará nada aún</p>
                        </div>
                    </div>
                </div>

                {/* Map Section */}
                <div className="py-16 border-t border-gray-100 mt-16">
                    <h2 className="text-2xl font-bold text-[#222222] mb-8">A dónde irás</h2>
                    <div className="w-full h-[550px] bg-gray-50 rounded-[32px] relative overflow-hidden shadow-inner border border-gray-100">
                        <LeafletMap
                            center={listing.lat && listing.lng ? [listing.lat, listing.lng] : null}
                            zoom={15}
                        />
                    </div>
                </div>

            </main>

            {/* Photo Modal */}
            {isPhotoModalOpen && (
                <div className="fixed inset-0 bg-white z-[100] flex flex-col font-inherit animate-in fade-in duration-300">
                    <div className="px-4 md:px-6 py-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                        <button
                            onClick={() => setIsPhotoModalOpen(false)}
                            className="hover:bg-gray-100 p-2 rounded-full transition"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <div className="flex gap-4">
                            <button className="flex items-center gap-2 hover:bg-gray-100 px-4 py-2 rounded-lg font-semibold underline text-sm">
                                <Heart size={18} /> Guardar
                            </button>
                        </div>
                    </div>
                    <div className="overflow-y-auto flex-1 bg-white">
                        <div className="max-w-4xl mx-auto px-4 py-8 space-y-4 md:space-y-6">
                            {listing.images?.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img}
                                    alt={`Vista ${idx + 1}`}
                                    className="w-full object-cover rounded-xl"
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
