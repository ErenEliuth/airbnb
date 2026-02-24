import { Wifi, Tv, Mic, Car, Waves, Utensils, Wind, Dumbbell } from 'lucide-react';

export function StepAmenities({ data, updateData }) {
    const amenities = [
        { id: 'wifi', label: 'Wifi', icon: Wifi },
        { id: 'tv', label: 'TV', icon: Tv },
        { id: 'kitchen', label: 'Cocina', icon: Utensils },
        { id: 'washer', label: 'Lavadora', icon: Wind },
        { id: 'parking', label: 'Estacionamiento gratuito', icon: Car },
        { id: 'ac', label: 'Aire acondicionado', icon: Wind }, // Using Wind for AC as well
        { id: 'pool', label: 'Alberca', icon: Waves },
        { id: 'gym', label: 'Gimnasio', icon: Dumbbell },
    ];

    const toggleAmenity = (id) => {
        const current = data.amenities || [];
        if (current.includes(id)) {
            updateData({ amenities: current.filter(a => a !== id) });
        } else {
            updateData({ amenities: [...current, id] });
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">¿Qué servicios ofrece tu espacio?</h2>
            <p className="text-gray-500 mb-8">Selecciona todo lo que corresponda.</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {amenities.map((item) => {
                    const Icon = item.icon;
                    const isSelected = data.amenities?.includes(item.id);

                    return (
                        <div
                            key={item.id}
                            onClick={() => toggleAmenity(item.id)}
                            className={`
                                cursor-pointer flex flex-col p-4 rounded-xl border transition-all h-32 hover:border-gray-900
                                ${isSelected
                                    ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                                    : 'border-gray-200'}
                            `}
                        >
                            <Icon size={32} className="mb-auto text-gray-900" strokeWidth={1.5} />
                            <span className="font-semibold text-sm text-gray-900">
                                {item.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
