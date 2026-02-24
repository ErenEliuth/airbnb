import { Home, DoorOpen, Users } from 'lucide-react';

export function StepRoomType({ data, updateData }) {
    const options = [
        {
            id: 'entire',
            label: 'Un alojamiento entero',
            desc: 'Los huéspedes tienen toda la propiedad para ellos.',
            icon: Home
        },
        {
            id: 'private',
            label: 'Una habitación',
            desc: 'Los huéspedes tienen su propia habitación en un alojamiento, además de acceso a espacios compartidos.',
            icon: DoorOpen
        },
        {
            id: 'shared',
            label: 'Una habitación compartida',
            desc: 'Los huéspedes duermen en una habitación o área común que podrían compartir con otros.',
            icon: Users
        },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8 text-gray-900">¿Qué tipo de alojamiento ofreces?</h2>

            <div className="space-y-4">
                {options.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = data.room_type === opt.id;

                    return (
                        <div
                            key={opt.id}
                            onClick={() => updateData({ room_type: opt.id })}
                            className={`
                                cursor-pointer flex items-center justify-between p-6 rounded-xl border transition-all hover:border-gray-900
                                ${isSelected
                                    ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                                    : 'border-gray-200'}
                            `}
                        >
                            <div className="pr-4">
                                <h3 className="font-semibold text-lg text-gray-900">{opt.label}</h3>
                                <p className="text-gray-500 text-sm mt-1">{opt.desc}</p>
                            </div>
                            <Icon size={32} className="text-gray-900 flex-shrink-0" strokeWidth={1.5} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
