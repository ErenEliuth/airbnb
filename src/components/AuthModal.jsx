import { useAuth } from '../contexts/AuthContext';
import { Loader2, X } from 'lucide-react';
import { useState } from 'react';

export const AuthModal = () => {
    const { signInWithGoogle, isConfigured, isLoginModalOpen, closeLoginModal } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (!isLoginModalOpen) return null;

    if (!isConfigured) {
        return (
            <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full relative">
                    <button onClick={closeLoginModal} className="absolute top-4 left-4 p-2 hover:bg-gray-100 rounded-full transition">
                        <X size={16} />
                    </button>
                    <h3 className="text-xl font-bold text-yellow-800 mb-4 mt-6">Configuración Requerida</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        No se encontraron las credenciales de Supabase en el archivo .env
                    </p>
                </div>
            </div>
        );
    }

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
            closeLoginModal();
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/50" onClick={closeLoginModal} />

            <div className="bg-white w-full max-w-[568px] rounded-[12px] shadow-2xl relative z-10 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-center px-6 py-4 border-b border-gray-200 relative">
                    <button
                        onClick={closeLoginModal}
                        className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={16} />
                    </button>
                    <h1 className="font-bold text-[16px] text-[#222222]">
                        Iniciar sesión o registrarse
                    </h1>
                </div>

                <div className="p-6">
                    <h2 className="text-[22px] font-semibold text-[#222222] mb-6">
                        Te damos la bienvenida a Airbnb
                    </h2>

                    {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                    )}

                    <div className="space-y-4 mt-4">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 border border-black rounded-lg hover:bg-gray-50 font-semibold text-[#222222] transition-all"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                            ) : (
                                <>
                                    <img className="w-5 h-5 absolute left-10" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                                    Continúa con Google
                                </>
                            )}
                        </button>
                    </div>

                    <p className="mt-8 text-[12px] text-gray-500 leading-relaxed">
                        Al continuar, aceptas nuestros <span className="underline font-semibold cursor-pointer">Términos de servicio</span>, la <span className="underline font-semibold cursor-pointer">Política de privacidad</span> y la <span className="underline font-semibold cursor-pointer">Política de cookies</span>.
                    </p>
                </div>
            </div>
        </div>
    );
};
