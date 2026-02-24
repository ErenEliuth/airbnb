import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, X } from 'lucide-react';

export const Login = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn, signUp, signInWithGoogle, user, isConfigured } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!isConfigured) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-yellow-200 max-w-md w-full">
                    <h3 className="text-xl font-bold text-yellow-800 mb-4">Configuración Requerida</h3>
                    <p className="text-gray-600 mb-4 text-sm">
                        No se encontraron las credenciales de Supabase en el archivo .env
                    </p>
                    <pre className="bg-gray-100 p-3 rounded-lg text-xs overflow-auto">
                        VITE_SUPABASE_URL=...{"\n"}
                        VITE_SUPABASE_ANON_KEY=...
                    </pre>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                const { error } = await signIn(email, password);
                if (error) throw error;
            } else {
                const { error } = await signUp(email, password);
                if (error) throw error;
                alert("¡Revisa tu correo para confirmar tu cuenta!");
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setLoading(true);
            const { error } = await signInWithGoogle();
            if (error) throw error;
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/40 flex items-center justify-center p-4 sm:p-6 animate-fade-in relative overflow-hidden">
            {/* Background Suggestion - Could be an image of a cozy home */}
            <div className="absolute inset-0 z-0">
                <img
                    src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070"
                    className="w-full h-full object-cover blur-[2px]"
                    alt="background"
                />
                <div className="absolute inset-0 bg-black/30" />
            </div>

            <div className="bg-white w-full max-w-[568px] rounded-[12px] shadow-2xl relative z-10 overflow-hidden animate-fade-in">
                {/* Header */}
                <div className="flex items-center justify-center px-6 py-4 border-b border-gray-200 relative">
                    <button
                        onClick={() => navigate('/')}
                        className="absolute left-6 p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X size={16} />
                    </button>
                    <h1 className="font-bold text-[16px] text-[#222222]">
                        {isLogin ? 'Inicia sesión' : 'Regístrate'}
                    </h1>
                </div>

                <div className="p-6">
                    <h2 className="text-[22px] font-semibold text-[#222222] mb-6">
                        Te damos la bienvenida a Airbnb
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-0">
                            <div className="relative">
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Correo electrónico"
                                    className="w-full border border-gray-400 rounded-t-lg px-4 py-4 pt-6 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-transparent peer"
                                    id="email"
                                />
                                <label
                                    htmlFor="email"
                                    className="absolute left-4 top-1 text-[12px] text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-1 peer-focus:text-[12px]"
                                >
                                    Correo electrónico
                                </label>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Contraseña"
                                    className="w-full border border-gray-400 border-t-0 rounded-b-lg px-4 py-4 pt-6 focus:border-black focus:ring-1 focus:ring-black outline-none transition-all placeholder-transparent peer"
                                    id="password"
                                />
                                <label
                                    htmlFor="password"
                                    className="absolute left-4 top-1 text-[12px] text-gray-500 transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-[16px] peer-focus:top-1 peer-focus:text-[12px]"
                                >
                                    Contraseña
                                </label>
                            </div>
                        </div>

                        {error && (
                            <p className="text-red-500 text-xs font-semibold px-1">{error}</p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#FF385C] hover:bg-[#D80565] text-white font-bold py-3.5 rounded-lg transition-all active:scale-95 shadow-sm flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Continúa'}
                        </button>
                    </form>

                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-gray-200" />
                        <span className="text-[12px] text-gray-500 font-medium">o</span>
                        <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <div className="space-y-3">
                        <button
                            onClick={handleGoogleLogin}
                            disabled={loading}
                            className="w-full flex items-center justify-center gap-3 py-3 border border-black rounded-lg hover:bg-gray-50 font-semibold text-[#222222] transition-all"
                        >
                            <img className="w-5 h-5" src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
                            Continuar con Google
                        </button>

                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="w-full flex items-center justify-center gap-3 py-3 border border-black rounded-lg hover:bg-gray-50 font-semibold text-[#222222] transition-all"
                        >
                            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
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
