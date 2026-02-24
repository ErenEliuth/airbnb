import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Custom marker icon (Airbnb style)
const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Fix for default icons just in case Marker is used without custom icon elsewhere
(function fixLeafletIcons() {
    if (typeof L === 'undefined') return;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });
})();

function ChangeView({ center, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (center && Array.isArray(center) && center.length === 2 && typeof center[0] === 'number') {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
}

export function LeafletMap({ center, zoom = 13, scrollWheelZoom = true, className = "h-full w-full", onMarkerDrag }) {
    // Defensive check for coordinates
    const isValid = (coord) => typeof coord === 'number' && !isNaN(coord);
    const isValidCenter = Array.isArray(center) && center.length === 2 && isValid(center[0]) && isValid(center[1]);

    const position = isValidCenter ? center : [6.2442, -75.5812]; // Default to Medellin

    return (
        <MapContainer
            center={position}
            zoom={zoom}
            scrollWheelZoom={scrollWheelZoom}
            className={className}
            style={{ height: '100%', width: '100%' }} // Ensure height is explicitly set on the container
        >
            <ChangeView center={position} zoom={zoom} />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {isValidCenter && (
                <Marker
                    position={position}
                    icon={customIcon}
                    draggable={!!onMarkerDrag}
                    eventHandlers={{
                        dragend: (e) => {
                            if (onMarkerDrag) {
                                const marker = e.target;
                                const pos = marker.getLatLng();
                                onMarkerDrag({ lat: pos.lat, lng: pos.lng });
                            }
                        },
                    }}
                />
            )}
        </MapContainer>
    );
}
