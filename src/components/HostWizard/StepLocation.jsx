import { MapPin, Loader2, Check, Navigation } from 'lucide-react';
import { LeafletMap } from '../LeafletMap';
import { geocodeAddress, searchCities } from '../../lib/geocoding';
import { useState, useCallback, useEffect } from 'react';
import debounce from 'lodash.debounce';

export function StepLocation({ data, updateData }) {
    const [loading, setLoading] = useState(false);
    const [searchingCities, setSearchingCities] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mapCenter, setMapCenter] = useState(data.lat && data.lng ? [data.lat, data.lng] : null);

    // Initial center if address exists
    useEffect(() => {
        if (!mapCenter && data.city) {
            handleGeocode(data.city);
        }
    }, []);

    const handleGeocode = async (address) => {
        if (!address) return;
        setLoading(true);
        const coords = await geocodeAddress(address);
        if (coords) {
            updateData({
                lat: coords.lat,
                lng: coords.lng
            });
            setMapCenter([coords.lat, coords.lng]);
        }
        setLoading(false);
    };

    const debouncedGeocode = useCallback(
        debounce((address) => handleGeocode(address), 1000),
        []
    );

    const debouncedSearchCities = useCallback(
        debounce(async (query) => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }
            setSearchingCities(true);
            const cities = await searchCities(query);
            setSuggestions(cities);
            setShowSuggestions(true);
            setSearchingCities(false);
        }, 500),
        []
    );

    const onCityChange = (e) => {
        const val = e.target.value;
        updateData({ city: val });
        debouncedSearchCities(val);
    };

    const selectCity = (city) => {
        updateData({
            city: city.name,
            lat: city.lat,
            lng: city.lng
        });
        setMapCenter([city.lat, city.lng]);
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const onAddressChange = (e) => {
        const val = e.target.value;
        updateData({ location: val });
        debouncedGeocode(`${val}, ${data.city || ''}`);
    };

    const onMarkerDrag = (coords) => {
        updateData({ lat: coords.lat, lng: coords.lng });
        setMapCenter([coords.lat, coords.lng]);
    };

    const useCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización.');
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                updateData({ lat: latitude, lng: longitude });
                setMapCenter([latitude, longitude]);
                setLoading(false);
            },
            (error) => {
                console.error('Error al obtener ubicación:', error);
                alert('No se pudo obtener tu ubicación. Por favor, asegúrate de dar permisos.');
                setLoading(false);
            }
        );
    };

    return (
        <div className="max-w-2xl mx-auto text-center" onClick={() => setShowSuggestions(false)}>
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">¿Dónde se encuentra tu espacio?</h2>
            <p className="text-gray-500 mb-8">Solo compartiremos la dirección con los huéspedes después de que hayan hecho la reservación.</p>

            <div className="bg-gray-100 p-8 rounded-xl flex flex-col items-center justify-center min-h-[300px]">
                {/* City Input with Suggestions */}
                <div className="relative w-full max-w-md mb-4" onClick={(e) => e.stopPropagation()}>
                    <div className="bg-white rounded-full shadow-lg flex items-center p-4">
                        <MapPin className="text-rose-500 mr-3" />
                        <input
                            type="text"
                            placeholder="Ciudad (ej: Bogotá, Medellín)"
                            className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                            value={data.city || ''}
                            onChange={onCityChange}
                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                        />
                        {(loading || searchingCities) && <Loader2 className="animate-spin text-gray-400 ml-2" size={16} />}
                    </div>

                    {/* Suggestions list */}
                    {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 z-[2000] overflow-hidden text-left">
                            {suggestions.length > 0 ? (
                                suggestions.map((city, i) => (
                                    <button
                                        key={i}
                                        onClick={() => selectCity(city)}
                                        className="w-full flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition text-left border-b border-gray-50 last:border-0"
                                    >
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <MapPin size={16} className="text-gray-600" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-gray-900">{city.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{city.display_name}</div>
                                        </div>
                                        <Check size={16} className="text-gray-300" />
                                    </button>
                                ))
                            ) : data.city?.length >= 3 && !searchingCities ? (
                                <div className="px-6 py-4 text-gray-500 text-sm flex items-center gap-2">
                                    <MapPin size={16} className="opacity-50" />
                                    No se encontraron ciudades en Colombia
                                </div>
                            ) : null}
                        </div>
                    )}
                </div>

                <button
                    onClick={useCurrentLocation}
                    className="flex items-center gap-2 text-rose-500 text-sm font-semibold hover:bg-rose-50 px-4 py-2 rounded-full transition mb-4 group ring-1 ring-rose-200"
                >
                    <Navigation size={16} className="group-hover:rotate-12 transition-transform" />
                    Utilizar mi ubicación actual
                </button>

                {/* Address Input */}
                <div className="relative w-full max-w-md">
                    <div className="bg-white rounded-full shadow-lg flex items-center p-4">
                        <MapPin className="text-gray-400 mr-3" />
                        <input
                            type="text"
                            placeholder="Dirección completa"
                            className="flex-1 outline-none text-gray-900 placeholder-gray-500"
                            value={data.location || ''}
                            onChange={onAddressChange}
                        />
                    </div>
                </div>

                <div className="mt-8 relative w-full h-80 bg-gray-200 rounded-lg overflow-hidden shadow-inner">
                    {mapCenter ? (
                        <LeafletMap
                            center={mapCenter}
                            zoom={15}
                            onMarkerDrag={onMarkerDrag}
                        />
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-10">
                            <MapPin size={48} className="mb-2 opacity-20" />
                            <p className="text-sm">Ingresa una dirección para ver el mapa</p>
                        </div>
                    )}

                    {mapCenter && (
                        <div className="absolute bottom-4 left-4 z-[1000] bg-white px-3 py-1.5 rounded-lg shadow-md text-xs font-semibold text-gray-600">
                            Puedes arrastrar el marcador para mayor precisión
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
