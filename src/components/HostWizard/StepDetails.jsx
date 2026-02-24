import { Minus, Plus } from 'lucide-react';

export function StepDetails({ data, updateData }) {
    const incrementGuests = () => updateData({ max_guests: (data.max_guests || 1) + 1 });
    const decrementGuests = () => updateData({ max_guests: Math.max(1, (data.max_guests || 1) - 1) });

    return (
        <div className="max-w-2xl mx-auto font-inherit">
            <h2 className="text-3xl font-bold mb-10 text-[#222222] tracking-tight">Ahora, danos los detalles finales</h2>

            <div className="space-y-8">
                {/* Max Guests */}
                <div className="flex items-center justify-between pb-8 border-b border-gray-100">
                    <div>
                        <h3 className="font-bold text-lg text-[#222222]">Cantidad de huéspedes</h3>
                        <p className="text-gray-500 text-sm">¿Cuántas personas pueden quedarse en tu alojamiento?</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={decrementGuests}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition active:scale-95 text-gray-600"
                        >
                            <Minus size={18} strokeWidth={3} />
                        </button>
                        <span className="text-lg font-bold w-6 text-center text-[#222222]">{data.max_guests || 1}</span>
                        <button
                            onClick={incrementGuests}
                            className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-black transition active:scale-95 text-gray-600"
                        >
                            <Plus size={18} strokeWidth={3} />
                        </button>
                    </div>
                </div>

                {/* Title */}
                <div className="pt-2">
                    <label className="block text-lg font-bold text-[#222222] mb-3">Título del anuncio</label>
                    <input
                        type="text"
                        maxLength={50}
                        value={data.title}
                        onChange={(e) => updateData({ title: e.target.value })}
                        className="w-full p-4 border border-gray-400 rounded-lg text-lg focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder:text-gray-400"
                        placeholder="Cabaña acogedora frente al lago"
                    />
                    <div className="text-xs text-gray-500 mt-2 text-right">{data.title.length}/50</div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-lg font-bold text-[#222222] mb-3">Descripción</label>
                    <textarea
                        rows={5}
                        maxLength={500}
                        value={data.description}
                        onChange={(e) => updateData({ description: e.target.value })}
                        className="w-full p-4 border border-gray-400 rounded-lg text-lg focus:border-black focus:ring-1 focus:ring-black outline-none resize-none transition-all placeholder:text-gray-400"
                        placeholder="Describe lo que hace especial a tu alojamiento..."
                    />
                    <div className="text-xs text-gray-500 mt-2 text-right">{data.description.length}/500</div>
                </div>

                {/* Price */}
                <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm">
                    <label className="block text-lg font-bold text-[#222222] mb-4">Precio por noche (COP)</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <span className="text-[#222222] text-xl font-bold">$</span>
                        </div>
                        <input
                            type="number"
                            value={data.price}
                            onChange={(e) => updateData({ price: e.target.value })}
                            className="w-full pl-10 p-4 border border-gray-400 rounded-lg text-2xl font-bold focus:border-black focus:ring-1 focus:ring-black outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
