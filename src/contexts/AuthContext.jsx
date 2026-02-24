import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const openLoginModal = () => setIsLoginModalOpen(true);
    const closeLoginModal = () => setIsLoginModalOpen(false);

    useEffect(() => {
        if (!supabase) {
            setLoading(false);
            return;
        }

        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        // Listen for changes on auth state (logged in, signed out, etc.)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email, password) => {
        if (!supabase) throw new Error("Supabase no está configurado. Faltan las credenciales en .env");
        return await supabase.auth.signUp({ email, password });
    };

    const signIn = async (email, password) => {
        if (!supabase) throw new Error("Supabase no está configurado. Faltan las credenciales en .env");
        return await supabase.auth.signInWithPassword({ email, password });
    };

    const signOut = async () => {
        if (!supabase) return;
        return await supabase.auth.signOut();
    };

    const signInWithGoogle = async () => {
        if (!supabase) throw new Error("Supabase no está configurado. Faltan las credenciales en .env");

        // Determinar la URL de redirección dinámicamente
        const redirectUrl = window.location.origin + import.meta.env.BASE_URL;

        return await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: redirectUrl
            }
        });
    };

    const value = {
        user,
        signUp,
        signIn,
        signOut,
        signInWithGoogle,
        isConfigured: !!supabase,
        isLoginModalOpen,
        openLoginModal,
        closeLoginModal
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
