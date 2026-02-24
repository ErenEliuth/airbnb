import { Home, Zap, HeartHandshake } from 'lucide-react';

export function StepCategory({ data, updateData }) {
    const categories = [
        { id: 'housing', label: 'Alojamiento', icon: Home },
        { id: 'experience', label: 'Experiencia', icon: Zap },
        { id: 'service', label: 'Servicio', icon: HeartHandshake },
    ];

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold mb-8 text-gray-900">¿Qué quieres ofrecer?</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => {
                    const Icon = cat.icon;
                    const isSelected = data.category === cat.id;

                    return (
                        <div
                            key={cat.id}
                            onClick={() => updateData({ category: cat.id })}
                            className={`
                                cursor-pointer flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all h-48
                                ${isSelected
                                    ? 'border-gray-900 bg-gray-50 ring-1 ring-gray-900'
                                    : 'border-gray-200 hover:border-gray-900 hover:bg-gray-50'}
                            `}
                        >
                            <Icon size={48} className={isSelected ? 'text-gray-900' : 'text-gray-500'} strokeWidth={1} />
                            <span className={`mt-4 font-semibold ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                                {cat.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
