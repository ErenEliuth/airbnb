import { Calendar } from 'lucide-react';

export function StepAvailability({ data, updateData }) {
    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold mb-2 text-gray-900">¿Cuándo estará disponible tu alojamiento?</h2>
            <p className="text-gray-500 mb-8">Elige las fechas en las que los huéspedes pueden reservar.</p>

            <div className="space-y-6 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center gap-4">
                    <Calendar className="text-rose-500 w-6 h-6" />
                    <span className="font-semibold text-lg">Rango de disponibilidad</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Desde</label>
                        <input
                            type="date"
                            value={data.available_from || ''}
                            onChange={(e) => updateData({ available_from: e.target.value })}
                            className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Hasta</label>
                        <input
                            type="date"
                            value={data.available_to || ''}
                            onChange={(e) => updateData({ available_to: e.target.value })}
                            className="w-full p-4 border border-gray-300 rounded-lg text-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none"
                            min={data.available_from || new Date().toISOString().split('T')[0]}
                        />
                    </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-500">
                    <p>Consejo: Mantén tu calendario actualizado para conseguir más reservaciones.</p>
                </div>
            </div>
        </div>
    );
}
