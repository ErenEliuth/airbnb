import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useSettings } from '../contexts/SettingsContext';

export function ListingCard({ listing }) {
    const { id, title, city, price, rating, images } = listing;
    const { user } = useAuth();
    const { formatPrice, t } = useSettings();
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const hasImages = images && images.length > 0;
    const imageList = hasImages ? images : ["https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"];

    useEffect(() => {
        checkFavoriteStatus();
    }, [user, id]);

    const checkFavoriteStatus = async () => {
        if (!user) return;
        const { data } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('listing_id', id)
            .single();
        setIsFavorite(!!data);
    };

    const toggleFavorite = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!user) {
            alert('Inicia sesión para guardar favoritos');
            return;
        }

        if (isFavorite) {
            await supabase.from('favorites').delete().eq('user_id', user.id).eq('listing_id', id);
            setIsFavorite(false);
        } else {
            await supabase.from('favorites').insert({ user_id: user.id, listing_id: id });
            setIsFavorite(true);
        }
    };

    const nextImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1));
    };

    return (
        <div className="group cursor-pointer font-inherit">
            <Link to={`${listing.category === 'experience' || listing.category === 'service' ? '/experience/' : '/listing/'}${id}`}>
                <div
                    className="relative aspect-[20/19] overflow-hidden rounded-[14px] bg-gray-100 mb-3"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <img
                        src={imageList[currentImageIndex]}
                        alt={title}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    />

                    {/* Navigation Arrows */}
                    {isHovered && imageList.length > 1 && (
                        <>
                            <button
                                onClick={prevImage}
                                className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition hover:scale-105 z-10 opacity-0 group-hover:opacity-100 duration-200"
                            >
                                <ChevronLeft size={16} className="text-gray-800" strokeWidth={3} />
                            </button>
                            <button
                                onClick={nextImage}
                                className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-1.5 shadow-sm transition hover:scale-105 z-10 opacity-0 group-hover:opacity-100 duration-200"
                            >
                                <ChevronRight size={16} className="text-gray-800" strokeWidth={3} />
                            </button>
                        </>
                    )}

                    {/* Pagination Dots */}
                    {imageList.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                            {imageList.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex
                                        ? 'w-1.5 bg-white opacity-100'
                                        : 'w-1.5 bg-white/60 opacity-60'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    <button
                        onClick={toggleFavorite}
                        className="absolute top-3 right-3 p-1 rounded-full z-10"
                    >
                        <Heart
                            className={`transition-all duration-300 ${isFavorite ? 'fill-[#FF385C] text-[#FF385C]' : 'text-white fill-black/20'}`}
                            size={24}
                            strokeWidth={2.5}
                        />
                    </button>

                    {/* Badge "Favorito entre huéspedes" */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full text-[12px] font-bold shadow-sm border border-gray-100/50 text-[#222222] leading-tight flex items-center gap-1.5">
                        {t('listing.guest_favorite')}
                    </div>
                </div>

                <div className="text-[#222222]">
                    <h3 className="font-bold text-[15px] leading-[19px] mb-0.5 truncate tracking-tight">
                        {title || `Lugar en ${city || 'Colombia'}`}
                    </h3>

                    <div className="flex items-center justify-between mt-1">
                        <div className="text-[15px] font-normal text-gray-600">
                            <span className="font-bold text-[#222222]">{formatPrice(listing.price)}</span>
                            <span> {t('listing.night')}</span>
                        </div>

                        <div className="flex items-center gap-1 text-[14px] font-normal">
                            <Star size={12} className="fill-[#222222] text-[#222222]" />
                            <span>{rating || "Nuevo"}</span>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}
