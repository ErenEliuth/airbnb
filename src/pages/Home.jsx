import { Navbar } from '../components/Navbar';
import { ListingCard } from '../components/ListingCard';
import { Footer } from '../components/Footer';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, XCircle, Filter, X } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSettings } from '../contexts/SettingsContext';

export function Home() {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();
    const { t, activeTab, formatPrice } = useSettings();
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    const cityFilter = searchParams.get('city');
    const guestsFilter = searchParams.get('guests');
    const startFilter = searchParams.get('start');
    const endFilter = searchParams.get('end');
    const minPriceFilter = searchParams.get('minPrice');
    const maxPriceFilter = searchParams.get('maxPrice');
    const roomTypesFilter = searchParams.get('roomTypes');

    // Advanced Filter Modal local states
    const [minPrice, setMinPrice] = useState(minPriceFilter || '');
    const [maxPrice, setMaxPrice] = useState(maxPriceFilter || '');
    const [selectedRoomTypes, setSelectedRoomTypes] = useState({
        "entire": roomTypesFilter?.includes("entire") || false,
        "private": roomTypesFilter?.includes("private") || false,
        "shared": roomTypesFilter?.includes("shared") || false
    });

    const roomTypeLabels = {
        "entire": "Alojamiento entero",
        "private": "Habitación privada",
        "shared": "Habitación compartida"
    };

    const roomTypeDescriptions = {
        "entire": "Un lugar solo para ti",
        "private": "Tu propia habitación en una casa o en un hotel, además de algunos espacios compartidos",
        "shared": "Un espacio para dormir y espacios comunes que se comparten con otras personas"
    };

    const mappedCategory =
        activeTab === 'experiencias' ? 'experience' :
            activeTab === 'servicios' ? 'service' : 'housing';

    const defaultExperiences = [
        { id: 'exp_1', title: 'Recorrido en bote por Cartagena', city: 'Cartagena', price: 150000, category: 'experience', images: ['https://images.unsplash.com/photo-1544320677-440ebc72a6b2?auto=format&fit=crop&q=80&w=800'] },
        { id: 'exp_2', title: 'Ruta del café en el Quindío', city: 'Quindío', price: 90000, category: 'experience', images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800'] },
        { id: 'exp_3', title: 'Clase de cocina colombiana', city: 'Bogotá', price: 120000, category: 'experience', images: ['https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&q=80&w=800'] },
        { id: 'exp_4', title: 'Senderismo en el Parque Tayrona', city: 'Santa Marta', price: 200000, category: 'experience', images: ['https://images.unsplash.com/photo-1473283147055-e39c51470d09?auto=format&fit=crop&q=80&w=800'] },
    ];

    const defaultServices = [
        { id: 'srv_1', title: 'Fotógrafo profesional para tus vacaciones', city: 'Medellín', price: 300000, category: 'service', images: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800'] },
        { id: 'srv_2', title: 'Chef privado a domicilio', city: 'Cartagena', price: 450000, category: 'service', images: ['https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800'] },
        { id: 'srv_3', title: 'Servicio de niñera certificada', city: 'Bogotá', price: 100000, category: 'service', images: ['https://images.unsplash.com/photo-1544413165-31cece7324cb?auto=format&fit=crop&q=80&w=800'] },
        { id: 'srv_4', title: 'Masaje relajante a domicilio', city: 'Medellín', price: 180000, category: 'service', images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800'] },
    ];

    useEffect(() => {
        fetchListings();

        // Listen for new listings created via Wizard
        window.addEventListener('listing-created', fetchListings);
        return () => window.removeEventListener('listing-created', fetchListings);
    }, [cityFilter, guestsFilter, startFilter, endFilter, minPriceFilter, maxPriceFilter, roomTypesFilter, activeTab]);

    // Sync local modal state with URL filters when modal opens
    useEffect(() => {
        if (isFilterModalOpen) {
            setMinPrice(minPriceFilter || '');
            setMaxPrice(maxPriceFilter || '');
            setSelectedRoomTypes({
                "entire": roomTypesFilter?.includes("entire") || false,
                "private": roomTypesFilter?.includes("private") || false,
                "shared": roomTypesFilter?.includes("shared") || false
            });
        }
    }, [isFilterModalOpen, minPriceFilter, maxPriceFilter, roomTypesFilter]);

    const fetchListings = async () => {
        try {
            setLoading(true);
            let query = supabase
                .from('listings')
                .select('*, reviews(rating)')
                .eq('category', mappedCategory)
                .order('created_at', { ascending: false });

            if (cityFilter) {
                query = query.ilike('city', `%${cityFilter}%`);
            }

            if (startFilter) {
                query = query.lte('available_from', startFilter);
            }

            if (endFilter) {
                query = query.gte('available_to', endFilter);
            }

            if (guestsFilter) {
                query = query.gte('max_guests', parseInt(guestsFilter));
            }

            if (minPriceFilter) {
                query = query.gte('price', parseInt(minPriceFilter));
            }

            if (maxPriceFilter) {
                query = query.lte('price', parseInt(maxPriceFilter));
            }

            if (roomTypesFilter) {
                const types = roomTypesFilter.split(',');
                query = query.in('room_type', types);
            }

            const { data, error } = await query;

            let results = (data || []).map(listing => {
                const reviews = listing.reviews || [];
                const avg = reviews.length > 0
                    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(2)
                    : null;
                return { ...listing, rating: avg };
            });

            // Add defaults if applicable
            if (activeTab === 'experiencias') {
                let filteredExp = [...defaultExperiences];
                if (minPriceFilter) filteredExp = filteredExp.filter(e => e.price >= parseInt(minPriceFilter));
                if (maxPriceFilter) filteredExp = filteredExp.filter(e => e.price <= parseInt(maxPriceFilter));
                results = [...results, ...filteredExp];
            } else if (activeTab === 'servicios') {
                let filteredSrv = [...defaultServices];
                if (minPriceFilter) filteredSrv = filteredSrv.filter(s => s.price >= parseInt(minPriceFilter));
                if (maxPriceFilter) filteredSrv = filteredSrv.filter(s => s.price <= parseInt(maxPriceFilter));
                results = [...results, ...filteredSrv];
            }

            setListings(results);
        } catch (error) {
            console.error('Error fetching listings:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        setSearchParams({});
        clearModalFilters();
    };

    const clearModalFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        setSelectedRoomTypes({
            "entire": false,
            "private": false,
            "shared": false
        });
    };

    const applyFilters = () => {
        const newParams = new URLSearchParams(searchParams);

        if (minPrice) newParams.set('minPrice', minPrice);
        else newParams.delete('minPrice');

        if (maxPrice) newParams.set('maxPrice', maxPrice);
        else newParams.delete('maxPrice');

        const activeTypes = Object.entries(selectedRoomTypes)
            .filter(([_, isActive]) => isActive)
            .map(([type]) => type);

        if (activeTypes.length > 0) newParams.set('roomTypes', activeTypes.join(','));
        else newParams.delete('roomTypes');

        setSearchParams(newParams);
        setIsFilterModalOpen(false);
    };

    // Group listings by city
    const listingsByCity = listings.reduce((acc, listing) => {
        const city = listing.city || 'Otras ubicaciones';
        if (!acc[city]) {
            acc[city] = [];
        }
        acc[city].push(listing);
        return acc;
    }, {});

    return (
        <div className="min-h-screen bg-white font-inherit">
            <Navbar />

            <main className="pt-24 md:pt-64 pb-24 px-4 sm:px-8 lg:px-12 xl:px-20 max-w-[2520px] mx-auto min-h-screen">

                {/* Mobile Category Tabs (Horizontal Scroll) */}
                <div className="md:hidden flex items-center gap-6 overflow-x-auto no-scrollbar pb-4 mb-4 border-b border-gray-100 -mx-4 px-4 sticky top-[72px] bg-white z-40">
                    {[
                        { id: 'alojamientos', label: 'Alojamientos', icon: '🏠' },
                        { id: 'experiencias', label: 'Experiencias', icon: '✨' },
                        { id: 'servicios', label: 'Servicios', icon: '🛠️' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex flex-col items-center gap-1 min-w-max pb-2 border-b-2 transition-all
                                ${activeTab === tab.id ? 'border-black text-black' : 'border-transparent text-gray-400'}`}
                        >
                            <span className="text-xl">{tab.icon}</span>
                            <span className={`text-[11px] font-bold ${activeTab === tab.id ? 'text-black' : 'text-gray-500'}`}>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Action Bar: Filters */}
                <div className="mb-8 flex items-center justify-between gap-4">
                    {/* Active Filters Bar (Mobile optimized) */}
                    {(cityFilter || guestsFilter || startFilter || endFilter) ? (
                        <div className="flex-1 overflow-hidden">
                            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                                {cityFilter && (
                                    <span className="bg-gray-100 px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 whitespace-nowrap">
                                        {cityFilter}
                                    </span>
                                )}
                                {guestsFilter && (
                                    <span className="bg-gray-100 px-3 py-1.5 rounded-full text-[11px] font-bold border border-gray-200 text-gray-700 whitespace-nowrap">
                                        {guestsFilter} {t('home.guests')}
                                    </span>
                                )}
                                <button
                                    onClick={clearFilters}
                                    className="text-[11px] font-black text-[#FF385C] underline uppercase tracking-tight whitespace-nowrap px-2"
                                >
                                    Borrar
                                </button>
                            </div>
                        </div>
                    ) : <div className="flex-1"></div>}

                    {/* Advanced Filters Button */}
                    <button
                        onClick={() => setIsFilterModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-xl hover:border-black transition shadow-sm bg-white text-xs font-bold shrink-0"
                    >
                        <Filter size={14} strokeWidth={3} />
                        Filtros
                    </button>
                </div>

                {loading ? (
                    <div className="space-y-16 mb-24">
                        <div>
                            <div className="flex items-center justify-between mb-8 px-1">
                                <div className="h-8 bg-gray-200 rounded-lg w-48 animate-pulse"></div>
                                <div className="h-px flex-1 bg-gray-100 ml-8 hidden md:block" />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-12">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="flex flex-col gap-3">
                                        <div className="w-full aspect-[20/19] bg-gray-200 rounded-[14px] animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded-md w-3/4 animate-pulse"></div>
                                        <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mb-24">
                        <div className="space-y-16">
                            {Object.keys(listingsByCity).length > 0 ? (
                                Object.entries(listingsByCity).map(([city, cityListings]) => (
                                    <div key={city}>
                                        <div className="flex items-center justify-between mb-8 px-1">
                                            <h2 className="text-[26px] font-bold text-[#222222] tracking-tight truncate capitalize">{activeTab} en {city}</h2>
                                            <div className="h-px flex-1 bg-gray-100 ml-8 hidden md:block" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-x-6 gap-y-12">
                                            {cityListings.map((listing) => (
                                                <ListingCard key={listing.id} listing={listing} />
                                            ))}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-32 text-center bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200 flex flex-col items-center max-w-4xl mx-auto px-6">
                                    <div className="bg-white p-6 rounded-full shadow-lg mb-8">
                                        <XCircle className="text-gray-300" size={64} strokeWidth={1} />
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-[#222222]">{t('home.no_results_title')}</h3>
                                    <p className="text-gray-500 text-lg max-w-md mx-auto mb-10 leading-relaxed">
                                        {t('home.no_results_desc')}
                                    </p>
                                    <button
                                        onClick={clearFilters}
                                        className="airbnb-button-primary"
                                    >
                                        {t('home.view_all')}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            <Footer />

            {/* Advanced Filters Modal (UI Only for demonstration) */}
            {isFilterModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col font-inherit shadow-2xl animate-in slide-in-from-bottom-10">

                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                            <button onClick={() => setIsFilterModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X size={20} />
                            </button>
                            <h2 className="font-bold text-[#222222] text-[16px]">Filtros</h2>
                            <div className="w-10"></div> {/* Spacer for centering */}
                        </div>

                        {/* Content */}
                        <div className="overflow-y-auto p-6 space-y-10 flex-1">

                            {/* Price Range */}
                            <section className="border-b border-gray-100 pb-10">
                                <h3 className="text-2xl font-semibold mb-2">Rango de precios</h3>
                                <p className="text-gray-500 text-[15px] mb-8">El precio por noche con tarifas e impuestos incluidos.</p>

                                <div className="mt-8 relative pt-10 px-4">
                                    {/* Mock Histogram */}
                                    <div className="absolute bottom-0 left-4 right-4 h-16 flex items-end justify-between gap-1 px-2 opacity-50">
                                        {[2, 5, 8, 4, 12, 20, 25, 18, 15, 10, 6, 8, 12, 24, 30, 15, 8, 4, 2].map((h, i) => (
                                            <div key={i} className="flex-1 bg-gray-300 rounded-t-sm" style={{ height: `${h * 3}%` }}></div>
                                        ))}
                                    </div>
                                    <div className="relative z-10 w-full h-8 bg-transparent">
                                        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2 rounded-full"></div>
                                        <div className="absolute top-1/2 left-[20%] right-[30%] h-1 bg-gray-800 -translate-y-1/2 rounded-full"></div>
                                        <div className="absolute top-1/2 left-[20%] w-8 h-8 bg-white border border-gray-300 shadow-md rounded-full -translate-y-1/2 -translate-x-1/2 cursor-pointer hover:scale-105 flex items-center justify-center"><div className="w-4 h-4 rounded-full bg-gray-500 opacity-20 hidden"></div></div>
                                        <div className="absolute top-1/2 right-[30%] w-8 h-8 bg-white border border-gray-300 shadow-md rounded-full -translate-y-1/2 translate-x-1/2 cursor-pointer hover:scale-105 flex items-center justify-center"></div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 mt-8">
                                    <div className="flex-1 border border-gray-400 focus-within:border-black focus-within:border-2 rounded-xl px-3 py-2 cursor-text transition-all">
                                        <div className="text-xs text-gray-500">Mínimo</div>
                                        <div className="flex items-center text-[#222222]">
                                            <span className="font-semibold mr-1">$</span>
                                            <input
                                                type="number"
                                                value={minPrice}
                                                onChange={(e) => setMinPrice(e.target.value)}
                                                className="w-full font-semibold outline-none bg-transparent"
                                                placeholder="100000"
                                            />
                                        </div>
                                    </div>
                                    <div className="text-gray-400">-</div>
                                    <div className="flex-1 border border-gray-400 focus-within:border-black focus-within:border-2 rounded-xl px-3 py-2 cursor-text transition-all">
                                        <div className="text-xs text-gray-500">Máximo</div>
                                        <div className="flex items-center text-[#222222]">
                                            <span className="font-semibold mr-1">$</span>
                                            <input
                                                type="number"
                                                value={maxPrice}
                                                onChange={(e) => setMaxPrice(e.target.value)}
                                                className="w-full font-semibold outline-none bg-transparent"
                                                placeholder="800000"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Type of place */}
                            <section className="border-b border-gray-100 pb-10">
                                <h3 className="text-2xl font-semibold mb-6">Tipo de alojamiento</h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(selectedRoomTypes).map(([type, isChecked]) => (
                                        <label key={type} className="flex items-start gap-4 p-4 border border-gray-200 rounded-xl cursor-pointer hover:border-black transition">
                                            <input
                                                type="checkbox"
                                                className="mt-1 w-5 h-5 accent-black rounded"
                                                checked={isChecked}
                                                onChange={() => setSelectedRoomTypes(prev => ({ ...prev, [type]: !isChecked }))}
                                            />
                                            <div>
                                                <div className="font-semibold text-[#222222]">{roomTypeLabels[type]}</div>
                                                <div className="text-sm text-gray-500">
                                                    {roomTypeDescriptions[type]}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white rounded-b-2xl">
                            <button
                                onClick={clearModalFilters}
                                className="underline text-[#222222] font-semibold hover:bg-gray-50 px-4 py-2 rounded-lg transition"
                            >
                                Limpiar todos
                            </button>
                            <button
                                onClick={applyFilters}
                                className="bg-[#222222] text-white px-8 py-3 rounded-xl font-semibold hover:bg-black transition shadow-md active:scale-95"
                            >
                                Mostrar alojamientos
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
