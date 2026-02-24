import { Globe, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
    return (
        <footer className="bg-gray-100 border-t border-gray-200 mt-12 pb-32 md:pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 border-b border-gray-300 pb-12">
                    {/* Asistencia */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Asistencia</h3>
                        <div className="flex flex-col space-y-3 text-sm text-gray-600">
                            <a href="#" className="hover:underline">Centro de Ayuda</a>
                            <a href="#" className="hover:underline">Obtén ayuda con un problema de seguridad</a>
                            <a href="#" className="hover:underline">AirCover</a>
                            <a href="#" className="hover:underline">Antidiscriminación</a>
                            <a href="#" className="hover:underline">Apoyo para discapacitados</a>
                            <a href="#" className="hover:underline">Opciones de cancelación</a>
                            <a href="#" className="hover:underline">Problemas en la zona</a>
                        </div>
                    </div>

                    {/* Cómo ser anfitrión */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Cómo ser anfitrión</h3>
                        <div className="flex flex-col space-y-3 text-sm text-gray-600">
                            <a href="#" className="hover:underline">Hazlo Airbnb</a>
                            <a href="#" className="hover:underline">AirCover para anfitriones</a>
                            <a href="#" className="hover:underline">Recursos para hospitalidad</a>
                            <a href="#" className="hover:underline">Foro de la comunidad</a>
                            <a href="#" className="hover:underline">Hospedaje responsable</a>
                        </div>
                    </div>

                    {/* Airbnb */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">Airbnb</h3>
                        <div className="flex flex-col space-y-3 text-sm text-gray-600">
                            <a href="#" className="hover:underline">Sala de prensa</a>
                            <a href="#" className="hover:underline">Funciones nuevas</a>
                            <a href="#" className="hover:underline">Carreras</a>
                            <a href="#" className="hover:underline">Inversionistas</a>
                            <a href="#" className="hover:underline">Estadías de Airbnb.org</a>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
                    <div className="flex flex-wrap gap-4 items-center">
                        <span>© 2026 Airbnb, Inc.</span>
                        <span className="hidden md:inline">·</span>
                        <a href="#" className="hover:underline">Privacidad</a>
                        <span className="hidden md:inline">·</span>
                        <a href="#" className="hover:underline">Términos</a>
                        <span className="hidden md:inline">·</span>
                        <a href="#" className="hover:underline">Mapa del sitio</a>
                        <span className="hidden md:inline">·</span>
                        <a href="#" className="hover:underline">Datos de la empresa</a>
                    </div>

                    <div className="flex items-center gap-6 font-semibold text-gray-900">
                        <div className="flex items-center gap-2 cursor-pointer hover:underline">
                            <Globe size={16} />
                            <span>Español (ES)</span>
                        </div>
                        <div className="cursor-pointer hover:underline">
                            $ COP
                        </div>
                        <div className="flex gap-4">
                            <Facebook size={18} className="cursor-pointer hover:text-gray-900" />
                            <Twitter size={18} className="cursor-pointer hover:text-gray-900" />
                            <Instagram size={18} className="cursor-pointer hover:text-gray-900" />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
