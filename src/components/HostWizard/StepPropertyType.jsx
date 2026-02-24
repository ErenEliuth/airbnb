import { Home, Building, Warehouse, Tent, Castle, Ship } from 'lucide-react';

export function StepPropertyType({ data, updateData }) {
    const types = [
        { id: 'house', label: 'Casa', icon: Home },
        { id: 'apartment', label: 'Departamento', icon: Building },
        { id: 'barn', label: 'Granero', icon: Warehouse },
        { id: 'cabin', label: 'Cabaña', icon: Tent },
        { id: 'castle', label: 'Castillo', icon: Castle },
        { id: 'boat', label: 'Barco', icon: Ship },
        // Add more as needed
    ];

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8 text-gray-900">¿Cuál de estas opciones describe mejor tu alojamiento?</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {types.map((type) => {
                    const Icon = type.icon;
                    const isSelected = data.property_type === type.id;

                    return (
                        <div
                            key={type.id}
                            onClick={() => updateData({ property_type: type.id })}
                            className={`
                                cursor-pointer flex flex-col p-4 rounded-xl border transition-all h-32 hover:border-gray-900
                                ${isSelected
                                    ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                                    : 'border-gray-200'}
                            `}
                        >
                            <Icon size={32} className="mb-auto text-gray-900" strokeWidth={1.5} />
                            <span className="font-semibold text-sm text-gray-900">
                                {type.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
