import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { useSettings } from '../contexts/SettingsContext';
import { Loader2, Star, Share, Heart, MapPin, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const mockData = {
    exp_1: { title: 'Recorrido en bote por Cartagena', city: 'Cartagena', price: 150000, category: 'experience', images: ['https://images.unsplash.com/photo-1544320677-440ebc72a6b2?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1583416750470-965b2707b355?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1512100356356-912f2ea1e45c?auto=format&fit=crop&q=80&w=800'] },
    exp_2: { title: 'Ruta del café en el Quindío', city: 'Quindío', price: 90000, category: 'experience', images: ['https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&q=80&w=800'] },
    exp_3: { title: 'Clase de cocina colombiana', city: 'Bogotá', price: 120000, category: 'experience', images: ['https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1528712306091-ed0763094c98?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&q=80&w=800'] },
    exp_4: { title: 'Senderismo en el Parque Tayrona', city: 'Santa Marta', price: 200000, category: 'experience', images: ['https://images.unsplash.com/photo-1473283147055-e39c51470d09?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1516382101683-93cf47e87ab1?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1534067784083-d39b83b32e18?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1518182170546-076616fd6aa0?auto=format&fit=crop&q=80&w=800'] },
    srv_1: { title: 'Fotógrafo profesional para tus vacaciones', city: 'Medellín', price: 300000, category: 'service', images: ['https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?auto=format&fit=crop&q=80&w=800'] },
    srv_2: { title: 'Chef privado a domicilio', city: 'Cartagena', price: 450000, category: 'service', images: ['https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1581349485608-9469926a8e5e?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1555244162-803834f70033?auto=format&fit=crop&q=80&w=800'] },
    srv_3: { title: 'Servicio de niñera certificada', city: 'Bogotá', price: 100000, category: 'service', images: ['https://images.unsplash.com/photo-1544413165-31cece7324cb?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1519340333755-56e9c1d04579?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=800'] },
    srv_4: { title: 'Masaje relajante a domicilio', city: 'Medellín', price: 180000, category: 'service', images: ['https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1600334129128-685054ea08cb?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800'] },
};

export function ExperienceDetails() {
    const { id } = useParams();
    const { formatPrice } = useSettings();
    const [loading, setLoading] = useState(true);
    const [experience, setExperience] = useState(null);

    useEffect(() => {
        const fetchExperience = async () => {
            if (mockData[id]) {
                setExperience(mockData[id]);
                setLoading(false);
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('listings')
                    .select('*')
                    .eq('id', id)
                    .single();

                if (data && !error) {
                    setExperience(data);
                } else {
                    setExperience({ ...mockData['exp_1'], title: 'Experiencia Personalizada', id });
                }
            } catch (err) {
                console.error(err);
                setExperience({ ...mockData['exp_1'], title: 'Experiencia Personalizada', id });
            } finally {
                setLoading(false);
            }
        };
        fetchExperience();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-rose-500" size={40} />
            </div>
        );
    }

    if (!experience) {
        return <div className="text-center py-20">Experiencia no encontrada</div>;
    }

    return (
        <div className="min-h-screen bg-white font-inherit pb-20">
            <Navbar />

            <main className="pt-16 md:pt-28 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12">

                {/* Mobile image hero */}
                <div className="md:hidden -mx-4 mb-6">
                    <div className="relative bg-gray-100 overflow-hidden" style={{ height: '280px' }}>
                        {experience.images && experience.images.length > 0 && (
                            <img
                                src={experience.images[0]}
                                alt={experience.title}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm active:scale-95">
                                <Share size={16} />
                            </button>
                            <button className="bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm active:scale-95">
                                <Heart size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Top Section: Images + Title Card */}
                <div className="flex flex-col lg:flex-row gap-10 xl:gap-16 items-start mb-16">

                    {/* Desktop Images Grid */}
                    <div className="hidden md:block w-full lg:w-[55%]">
                        <div className="grid grid-cols-2 gap-2 h-[450px] md:h-[600px] rounded-[24px] overflow-hidden">
                            {(experience.images && experience.images.length > 0 ? experience.images : ['https://images.unsplash.com/photo-1544320677-440ebc72a6b2?auto=format&fit=crop&q=80&w=800']).slice(0, 4).map((img, i) => (
                                <img key={i} src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition duration-500" />
                            ))}
                        </div>
                    </div>

                    {/* Right side info panel */}
                    <div className="w-full lg:w-[45%] flex flex-col justify-center sticky top-28">
                        <div className="flex justify-end gap-4 mb-6">
                            <button className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-full transition font-semibold text-sm underline"><Share size={16} /> Compartir</button>
                            <button className="flex items-center gap-2 hover:bg-gray-50 px-3 py-2 rounded-full transition font-semibold text-sm underline"><Heart size={16} /> Guardar</button>
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-bold text-[#222222] mb-6 leading-tight tracking-tight">
                            {experience.title}
                        </h1>
                        <p className="text-gray-600 text-[17px] mb-6 leading-relaxed">
                            Practica esnórquel en aguas cristalinas en 2 rutas que diseñamos tras años de exploración. Disfruta de playas privadas y tranquilas lejos de los vendedores: una experiencia única en la isla que ningún otro tour ofrece. Islas del Rosario todo incluido
                        </p>

                        <div className="flex items-center gap-2 text-[15px] font-bold text-[#222222] mb-10">
                            <Star className="fill-black w-4 h-4" /> 4.87 <span className="font-normal text-gray-500 underline ml-1">1552 reseñas</span>
                            <span className="text-gray-400 mx-2">·</span>
                            <span className="font-normal text-gray-500 underline">{experience.city}</span>
                        </div>

                        <div className="flex flex-col gap-6 border-t border-gray-200 pt-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                    <User className="text-gray-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-[#222222]">Anfitrión: Jonathan</div>
                                    <div className="text-sm text-gray-500">Guía local y trotamundos</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                                    <MapPin className="text-gray-500" />
                                </div>
                                <div>
                                    <div className="font-bold text-[#222222]">Parque centenario Entrada 1</div>
                                    <div className="text-sm text-gray-500">{experience.city}, Bolívar</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gray-200 w-full my-16"></div>

                {/* Bottom Section: Timeline & Booking Widget */}
                <div className="flex flex-col lg:flex-row gap-10 xl:gap-20 relative">

                    {/* Timeline "Qué harás" */}
                    <div className="w-full lg:w-[60%]">
                        <h2 className="text-2xl font-bold mb-8 text-[#222222]">Qué harás</h2>

                        <div className="relative border-l-2 border-gray-200 ml-8 space-y-12 pb-10">
                            {[
                                { title: 'Salir de Cartagena', desc: 'Se incluye un paseo en barco a las islas...', img: 'https://images.unsplash.com/photo-1544320677-440ebc72a6b2?auto=format&fit=crop&q=80&w=150' },
                                { title: 'Vista panorámica de las islas', desc: 'Llega a las islas y aprende algunos datos sobre este hermoso lugar.', img: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?auto=format&fit=crop&q=80&w=150' },
                                { title: 'Haz esnórquel', desc: 'Descubre la vibrante vida marina de los Corales en una de nuestras preciosas rutas, con equipo de buceo incluido.', img: 'https://images.unsplash.com/photo-1544320677-440ebc72a6b2?auto=format&fit=crop&q=80&w=150' },
                                { title: 'Relájate en una casa privada', desc: 'Llega a nuestra casa privada en la isla y disfruta de aperitivos...', img: 'https://images.unsplash.com/photo-1512100356356-912f2ea1e45c?auto=format&fit=crop&q=80&w=150' }
                            ].map((step, i) => (
                                <div key={i} className="relative pl-10 flex gap-6 mt-12 first:mt-0">
                                    <div className="absolute w-4 h-4 rounded-full bg-black -left-[9px] top-[40px] border-4 border-white"></div>
                                    <img src={step.img} alt="" className="w-24 h-24 rounded-[16px] object-cover shadow-sm bg-gray-100 flex-shrink-0" />
                                    <div className="pt-2">
                                        <h3 className="font-bold text-lg text-[#222222] mb-1">{step.title}</h3>
                                        <p className="text-gray-600 text-[15px] leading-relaxed">{step.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Booking Widget (Mostrar Fechas) */}
                    <div className="w-full lg:w-[40%]">
                        <div className="sticky top-28 bg-white border border-gray-200 shadow-xl rounded-[24px] p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <div className="text-[22px] font-bold text-[#222222]">Desde {formatPrice(experience.price)}</div>
                                    <div className="text-sm text-gray-500">por participante</div>
                                    <div className="text-sm text-[#E61E4D]">Cancelación gratuita</div>
                                </div>
                                <button className="bg-[#E61E4D] hover:bg-[#D70466] text-white font-bold py-3.5 px-6 rounded-xl transition shadow-md hover:-translate-y-0.5 active:translate-y-0 active:scale-95 duration-200">
                                    Mostrar fechas
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center bg-gray-50 opacity-60">
                                    <div>
                                        <div className="font-bold text-[#222222] line-through">Mañana, 25 de febrero</div>
                                        <div className="text-sm text-gray-500 line-through">8:30 a.m. - 4:15 p.m.</div>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-500">Agotada</span>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-black transition">
                                    <div>
                                        <div className="font-bold text-[#222222]">jueves, 26 de febrero</div>
                                        <div className="text-sm text-gray-500">8:30 a.m. - 4:15 p.m.</div>
                                    </div>
                                    <span className="text-sm font-bold text-[#E61E4D]">5 cupos disponibles</span>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-black transition">
                                    <div>
                                        <div className="font-bold text-[#222222]">viernes, 27 de febrero</div>
                                        <div className="text-sm text-gray-500">8:30 a.m. - 4:30 p.m.</div>
                                    </div>
                                    <span className="text-sm font-semibold text-[#222222]">20 cupos disponibles</span>
                                </div>

                                <div className="border border-gray-200 rounded-xl p-4 flex justify-between items-center cursor-pointer hover:border-black transition">
                                    <div>
                                        <div className="font-bold text-[#222222]">viernes, 27 de febrero</div>
                                        <div className="text-sm text-gray-500">8:30 p.m. - 4:30 a.m.</div>
                                    </div>
                                    <span className="text-sm font-semibold text-[#222222]">20 cupos disponibles</span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <button className="font-bold text-[#222222] underline hover:bg-gray-50 px-4 py-2 rounded-lg transition">Revisa todas las fechas</button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />

            {/* Mobile sticky footer */}
            <div
                className="md:hidden fixed left-0 right-0 bg-white border-t border-gray-200 px-5 flex items-center justify-between z-[45]"
                style={{
                    bottom: 'calc(60px + env(safe-area-inset-bottom))',
                    paddingTop: '12px',
                    paddingBottom: '12px',
                    boxShadow: '0 -4px 16px rgba(0,0,0,0.06)'
                }}
            >
                <div>
                    <div className="text-[13px] font-bold text-[#222222]">Desde {formatPrice(experience.price)}</div>
                    <div className="text-[11px] text-gray-500">por participante · Cancelación gratuita</div>
                </div>
                <button className="bg-gradient-to-r from-[#E61E4D] via-[#E31C5F] to-[#D70466] text-white px-6 py-3 rounded-[10px] font-bold text-[14px] shadow-sm active:scale-95">
                    Ver fechas
                </button>
            </div>
        </div>
    );
}
