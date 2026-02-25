import { useEffect, useState } from 'react';
import { Navbar } from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';
import {
    Loader2, Plus, Trash2, MapPin, Star, Building2,
    User, Briefcase, Users, ChevronRight, Edit2,
    MessageSquare, CheckCircle2
} from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es, enUS, fr } from 'date-fns/locale';
import { WizardModal } from '../components/HostWizard/WizardModal';

export function ProfilePage() {
    const { user, openLoginModal } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const { t, formatPrice, language } = useSettings();
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isWizardOpen, setIsWizardOpen] = useState(false);

    const dateLocale = language === 'en' ? enUS : language === 'fr' ? fr : es;

    const activeTab = searchParams.get('tab') || 'about';
    const setActiveTab = (tab) => setSearchParams({ tab });

    useEffect(() => {
        if (!user) {
            navigate('/');
            openLoginModal();
            return;
        }
        fetchUserListings();

        // Listen for new listings created via Wizard
        window.addEventListener('listing-created', fetchUserListings);
        return () => window.removeEventListener('listing-created', fetchUserListings);
    }, [user, navigate]);

    const fetchUserListings = async () => {
        try {
            const { data, error } = await supabase
                .from('listings')
                .select('*, bookings(*)')
                .eq('host_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setListings(data);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (listingId) => {
        if (!confirm(t('host.delete_confirm') || '¿Estás seguro de que quieres eliminar este alojamiento? Esta acción no se puede deshacer.')) return;

        try {
            const { error } = await supabase
                .from('listings')
                .delete()
                .eq('id', listingId)
                .eq('host_id', user.id);

            if (error) throw error;

            setListings(prev => prev.filter(l => l.id !== listingId));
        } catch (error) {
            console.error('Error deleting listing:', error);
            alert('Error: ' + error.message);
        }
    };

    const handleReleaseBooking = async (e, booking, listing) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm('¿Estás seguro de que quieres cancelar esta reserva y liberar las fechas?')) return;

        try {
            const { data: updatedBooking, error: bookingErr } = await supabase
                .from('bookings')
                .update({ status: 'released' })
                .eq('id', booking.id)
                .select()
                .single();

            if (bookingErr) throw new Error('No se pudo cancelar la reserva. Por favor, asegúrate de haber ejecutado SQL Editor con los permisos de UPDATE correspondientes.');

            await supabase.from('notifications').insert({
                user_id: booking.user_id,
                type: 'booking_released',
                title: '📋 Reserva cancelada por el anfitrión',
                message: `El anfitrión liberó tus fechas reservadas del ${format(parseISO(booking.check_in), "d 'de' MMM", { locale: dateLocale })} al ${format(parseISO(booking.check_out), "d 'de' MMM yyyy", { locale: dateLocale })} en "${listing.title}". Las fechas ya están disponibles de nuevo.`,
                booking_id: booking.id,
                listing_id: booking.listing_id,
            });

            // Clean blocked_dates array in listings table as a fallback cache
            try {
                const { data: currentListing } = await supabase
                    .from('listings')
                    .select('blocked_dates')
                    .eq('id', listing.id)
                    .single();

                if (currentListing?.blocked_dates) {
                    const cleanedDates = currentListing.blocked_dates.filter(b => b.booking_id !== booking.id);
                    await supabase
                        .from('listings')
                        .update({ blocked_dates: cleanedDates })
                        .eq('id', listing.id);
                }
            } catch (err) { }

            // Update local state
            setListings(prev => prev.map(l => ({
                ...l,
                bookings: l.id === listing.id ? l.bookings?.map(b => b.id === booking.id ? { ...b, status: 'released' } : b) : l.bookings
            })));

            alert('Las fechas han sido liberadas exitosamente.');
        } catch (error) {
            console.error(error);
            alert('Error al liberar reserva: ' + error.message);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-[#FF385C]" size={48} strokeWidth={2.5} />
                <p className="text-gray-500 font-medium font-inherit">{t('home.loading')}</p>
            </div>
        );
    }

    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Usuario';
    const userInitials = userName.charAt(0).toUpperCase();

    return (
        <div className="min-h-screen bg-white font-inherit">
            <Navbar />

            <main className="pt-16 md:pt-24 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 pb-32">
                <div className="flex flex-col lg:flex-row gap-16">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-80 flex-shrink-0">
                        <h1 className="text-3xl font-bold text-[#222222] mb-8">{t('profile.title')}</h1>

                        <nav className="flex flex-col gap-2">
                            <button
                                onClick={() => setActiveTab('about')}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-medium text-left
                                    ${activeTab === 'about' ? 'bg-[#f7f7f7] text-[#222222] shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className={`p-2 rounded-lg ${activeTab === 'about' ? 'bg-white shadow-sm' : ''}`}>
                                    <User size={20} className={activeTab === 'about' ? 'text-[#222222]' : 'text-gray-400'} />
                                </div>
                                <span>{t('profile.about_me')}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('listings')}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-medium text-left
                                    ${activeTab === 'listings' ? 'bg-[#f7f7f7] text-[#222222] shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className={`p-2 rounded-lg ${activeTab === 'listings' ? 'bg-white shadow-sm' : ''}`}>
                                    <Briefcase size={20} className={activeTab === 'listings' ? 'text-[#222222]' : 'text-gray-400'} />
                                </div>
                                <span>{t('profile.aloja')}</span>
                            </button>

                            <button
                                onClick={() => setActiveTab('connections')}
                                className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-medium text-left
                                    ${activeTab === 'connections' ? 'bg-[#f7f7f7] text-[#222222] shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}
                            >
                                <div className={`p-2 rounded-lg ${activeTab === 'connections' ? 'bg-white shadow-sm' : ''}`}>
                                    <Users size={20} className={activeTab === 'connections' ? 'text-[#222222]' : 'text-gray-400'} />
                                </div>
                                <span>{t('profile.connections')}</span>
                            </button>
                        </nav>
                    </aside>

                    {/* Content Area */}
                    <div className="flex-1">

                        {activeTab === 'about' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-2xl font-bold text-[#222222]">{t('profile.about_me')}</h2>
                                    <button className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-sm font-semibold border border-gray-200 shadow-sm">
                                        <Edit2 size={14} />
                                        {t('profile.edit')}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                                    {/* Profile Card */}
                                    <div className="md:col-span-4">
                                        <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_16px_32px_rgba(0,0,0,0.08)] p-8 flex flex-col items-center text-center">
                                            <div className="w-24 h-24 rounded-full bg-[#222222] text-white flex items-center justify-center text-4xl font-black mb-4 relative shadow-lg">
                                                {user?.user_metadata?.avatar_url ? (
                                                    <img src={user.user_metadata.avatar_url} alt={userName} className="w-full h-full object-cover rounded-full" />
                                                ) : userInitials}
                                                <div className="absolute -bottom-1 -right-1 bg-white p-1 rounded-full shadow-md">
                                                    <CheckCircle2 size={20} className="text-[#FF385C] fill-white" />
                                                </div>
                                            </div>
                                            <h3 className="text-2xl font-black text-[#222222] mb-1">{userName}</h3>
                                            <p className="text-gray-500 font-medium">{t('profile.guest')}</p>
                                        </div>
                                    </div>

                                    {/* Complete Profile Area */}
                                    <div className="md:col-span-8 space-y-12">
                                        <div className="flex flex-col md:flex-row gap-8 items-start">
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-[#222222] mb-3">{t('profile.complete_profile')}</h3>
                                                <p className="text-gray-500 leading-relaxed max-w-lg mb-6">
                                                    {t('profile.complete_desc')}
                                                </p>
                                                <button className="bg-[#FF385C] hover:bg-[#D80565] text-white px-8 py-3.5 rounded-xl font-bold transition shadow-lg active:scale-95">
                                                    {t('profile.let_start')}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100 w-full" />

                                        <div>
                                            <h3 className="text-xl font-bold text-[#222222] mb-6 flex items-center gap-3">
                                                <MessageSquare size={20} className="text-gray-400" />
                                                {t('profile.reviews_by_me')}
                                            </h3>
                                            <p className="text-gray-400 italic">
                                                {t('profile.no_reviews')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'listings' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                                    <h2 className="text-2xl font-bold text-[#222222]">{t('profile.aloja')}</h2>
                                    <button
                                        onClick={() => setIsWizardOpen(true)}
                                        className="flex items-center justify-center gap-2 bg-[#222222] hover:bg-black text-white px-6 py-3 rounded-xl font-bold transition shadow-lg active:scale-95"
                                    >
                                        <Plus size={18} strokeWidth={3} />
                                        {t('host.create_new')}
                                    </button>
                                </div>
                                <p className="text-gray-500 font-medium mb-10 -mt-8">
                                    {t('host.manage_desc') || 'Gestiona tus anuncios y llega a más huéspedes alrededor del mundo.'}
                                </p>

                                {listings.length === 0 ? (
                                    <div className="text-center py-20 bg-[#f7f7f7] rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center px-8">
                                        <div className="bg-white p-6 rounded-full shadow-xl mb-8">
                                            <Building2 size={48} className="text-gray-200" strokeWidth={1} />
                                        </div>
                                        <h3 className="text-xl font-bold text-[#222222] mb-2">{t('host.no_listings')}</h3>
                                        <p className="text-gray-500 mb-8 max-w-sm">{t('host.earn_money')}</p>
                                        <button
                                            onClick={() => setIsWizardOpen(true)}
                                            className="bg-[#FF385C] text-white px-8 py-3 rounded-full font-bold hover:bg-[#D80565] transition shadow-md"
                                        >
                                            {t('host.create_first')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                                        {listings.map((listing) => (
                                            <div key={listing.id} className="group relative">
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        handleDelete(listing.id);
                                                    }}
                                                    className="absolute top-3 right-3 z-20 bg-white/90 backdrop-blur-md p-2.5 rounded-full shadow-lg text-gray-400 hover:text-[#FF385C] transition-all opacity-0 group-hover:opacity-100 border border-gray-100"
                                                >
                                                    <Trash2 size={16} strokeWidth={2.5} />
                                                </button>

                                                <Link to={`/listing/${listing.id}`} className="block">
                                                    <div className="relative aspect-[4/3] rounded-[24px] overflow-hidden bg-gray-100 mb-4 shadow-sm group-hover:shadow-xl transition-all duration-300">
                                                        <img
                                                            src={listing.images?.[0] || 'https://via.placeholder.com/800'}
                                                            alt={listing.title}
                                                            className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                        />
                                                    </div>
                                                    <div className="px-1">
                                                        <h4 className="font-bold text-[#222222] truncate uppercase tracking-tight mb-1">{listing.title}</h4>
                                                        <div className="flex items-center gap-1.5 text-gray-500 text-sm font-medium mb-2">
                                                            <MapPin size={12} className="text-gray-400" />
                                                            <span className="truncate">{listing.city || listing.location}</span>
                                                        </div>
                                                        <p className="text-[#222222] font-black">
                                                            {formatPrice(listing.price)}
                                                            <span className="text-gray-400 font-medium text-xs"> / {t('listing.night')}</span>
                                                        </p>
                                                    </div>
                                                </Link>

                                                {/* Active Bookings list */}
                                                {listing.bookings?.filter(b => b.status === 'confirmed').length > 0 && (
                                                    <div className="mt-5 p-4 border border-rose-100 bg-[#FF385C]/5 rounded-2xl relative z-10 w-[95%] mx-auto shadow-sm">
                                                        <h5 className="font-bold text-sm text-[#FF385C] mb-3 uppercase tracking-wider text-center">En uso - Reservas activas</h5>
                                                        <div className="space-y-3">
                                                            {listing.bookings.filter(b => b.status === 'confirmed').map(b => (
                                                                <div key={b.id} className="bg-white rounded-xl p-3 flex flex-col gap-2 border border-rose-100 shadow-sm">
                                                                    <div className="text-[13px] font-semibold text-gray-800 text-center">
                                                                        Del {format(parseISO(b.check_in), "dd MMM")} al {format(parseISO(b.check_out), "dd MMM, yyyy")}
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => handleReleaseBooking(e, b, listing)}
                                                                        className="text-[13px] w-full text-center text-rose-600 hover:bg-[#FF385C] hover:text-white border border-rose-200 py-1.5 px-3 rounded-lg font-bold transition"
                                                                    >
                                                                        Liberar fechas
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'connections' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 py-20 text-center">
                                <Users size={64} className="mx-auto text-gray-100 mb-6" strokeWidth={1} />
                                <h2 className="text-2xl font-bold text-[#222222] mb-2">{t('profile.connections')}</h2>
                                <p className="text-gray-400 max-w-sm mx-auto">Conecta con tus amigos y otros miembros de la comunidad para ver sus recomendaciones.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <WizardModal isOpen={isWizardOpen} onClose={() => {
                setIsWizardOpen(false);
                fetchUserListings();
            }} />
        </div>
    );
}
